// Skeleton of the Mii body (shared/mii-body.js), used by widgets/mii3d.html and tools/mii-anim-build.html.
// The body is modeled in a T pose, in the units of the renderer's 3D heads (about 131 tall), facing +z.
// Bones have no rotation at rest, so a bone's rotation is directly its turn away from the T pose.
// "L" bones are on the -x side, the screen left when the Mii faces the camera.
window.MiiRig = (function () {
  // name, parent index, x, y, z (T pose, world units)
  var BONES = [
    ['base', -1, 0, 0, 0],
    ['hips', 0, 0, 56, 0],
    ['spine', 1, 0, 60, 0],
    ['neck', 2, 0, 112, 0],
    ['armL', 2, -18, 97.5, 0],
    ['foreL', 4, -40, 97.5, 0],
    ['armR', 2, 18, 97.5, 0],
    ['foreR', 6, 40, 97.5, 0],
    ['thighL', 1, -9.5, 54, 0],
    ['kneeL', 8, -9.5, 26, 0],
    ['footL', 9, -9.5, 5, 0],
    ['thighR', 1, 9.5, 54, 0],
    ['kneeR', 11, 9.5, 26, 0],
    ['footR', 12, 9.5, 5, 0]
  ];
  var INDEX = {};
  BONES.forEach(function (b, i) {
    INDEX[b[0]] = i;
  });

  function smooth(e0, e1, x) {
    var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  // Two bones per vertex, blended near the joints: [a, b, weight of a].
  function weights(part, x, y) {
    var s = x < 0 ? 'L' : 'R';
    var ax = Math.abs(x);
    if (part === 'shirt') {
      if (y > 110 && ax < 8) {
        return [INDEX.neck, INDEX.spine, smooth(110, 114, y)];
      }
      if (y > 86 && y < 108 && ax > 14) {
        if (ax > 34) {
          return [INDEX['fore' + s], INDEX['arm' + s], smooth(35, 45, ax)];
        }
        return [INDEX['arm' + s], INDEX.spine, smooth(15, 22, ax)];
      }
      return [INDEX.spine, INDEX.spine, 1];
    }
    if (part === 'pants') {
      if (y > 42) {
        return [INDEX.hips, INDEX['thigh' + s], smooth(48, 58, y)];
      }
      if (y > 14) {
        return [INDEX['thigh' + s], INDEX['knee' + s], smooth(22, 31, y)];
      }
      return [INDEX['knee' + s], INDEX['foot' + s], smooth(6, 12, y)];
    }
    return [INDEX['foot' + s], INDEX['foot' + s], 1];
  }

  function b64(s, Type) {
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new Type(bytes.buffer);
  }

  function geometry(THREE, p) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(b64(p.pos, Float32Array), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(b64(p.nrm, Float32Array), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(b64(p.uv, Float32Array), 2));
    g.setIndex(new THREE.BufferAttribute(b64(p.idx, Uint16Array), 1));
    return g;
  }

  var geoCache = {};

  function bodyGeometry(THREE, part) {
    if (geoCache[part]) {
      return geoCache[part];
    }
    var g = geometry(THREE, window.MII_MODEL.body[part]);
    var pos = g.attributes.position;
    var si = new Uint16Array(pos.count * 4);
    var sw = new Float32Array(pos.count * 4);
    for (var i = 0; i < pos.count; i++) {
      var w = weights(part, pos.getX(i), pos.getY(i));
      si[i * 4] = w[0];
      si[i * 4 + 1] = w[1];
      sw[i * 4] = w[2];
      sw[i * 4 + 1] = 1 - w[2];
    }
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    geoCache[part] = g;
    return g;
  }

  // The skinned body in a group: materials = { shirt, pants, shoes }. Returns { group, bones (by name) }.
  function body(THREE, materials) {
    var group = new THREE.Group();
    var list = BONES.map(function (b) {
      var bone = new THREE.Bone();
      bone.name = b[0];
      return bone;
    });
    var byName = {};
    BONES.forEach(function (b, i) {
      var parent = b[1] >= 0 ? BONES[b[1]] : null;
      list[i].position.set(b[2] - (parent ? parent[2] : 0), b[3] - (parent ? parent[3] : 0), b[4] - (parent ? parent[4] : 0));
      if (parent) {
        list[b[1]].add(list[i]);
      }
      byName[b[0]] = list[i];
    });
    group.add(list[0]);
    group.updateMatrixWorld(true);
    var skeleton = new THREE.Skeleton(list);
    ['shirt', 'pants', 'shoes'].forEach(function (k) {
      var m = new THREE.SkinnedMesh(bodyGeometry(THREE, k), materials[k]);
      m.frustumCulled = false;
      group.add(m);
      m.bind(skeleton);
    });
    return { group: group, bones: byName };
  }

  // Baked animations (shared/mii-anims.js) as three.js clips for an AnimationMixer.
  // Each frame: hips position (x, y, z, tenths of a unit), then a quaternion per bone (x, y, z, w, / 32767).
  function clips(THREE) {
    var A = window.MII_ANIMS;
    var out = {};
    if (!A) {
      return out;
    }
    Object.keys(A.clips).forEach(function (name) {
      var c = A.clips[name];
      var d = b64(c.data, Int16Array);
      var stride = 3 + A.bones.length * 4;
      var n = d.length / stride;
      var times = new Float32Array(n);
      for (var f = 0; f < n; f++) {
        times[f] = f / A.fps;
      }
      var hp = new Float32Array(n * 3);
      for (f = 0; f < n; f++) {
        for (var k = 0; k < 3; k++) {
          hp[f * 3 + k] = d[f * stride + k] / 10;
        }
      }
      var tracks = [new THREE.VectorKeyframeTrack('hips.position', times, hp)];
      A.bones.forEach(function (bone, b) {
        var q = new Float32Array(n * 4);
        for (f = 0; f < n; f++) {
          for (k = 0; k < 4; k++) {
            q[f * 4 + k] = d[f * stride + 3 + b * 4 + k] / 32767;
          }
        }
        tracks.push(new THREE.QuaternionKeyframeTrack(bone + '.quaternion', times, q));
      });
      out[name] = new THREE.AnimationClip(name, (n - 1) / A.fps, tracks);
      out[name].loop = !!c.loop;
    });
    return out;
  }

  return { BONES: BONES, INDEX: INDEX, geometry: geometry, body: body, clips: clips };
})();
