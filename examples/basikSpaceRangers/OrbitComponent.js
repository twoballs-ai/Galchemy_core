// OrbitComponent.js   (полностью)

export default function addOrbit(entity, {
    center  = null,     // GameObject3D.go | null
    radius  = 5,
    speed   = 1,        // рад/сек (CCW)
    tiltDeg = 0,        // наклон орбиты, градусы
    phase   = 0         // стартовый угол
  } = {}) {
  
    const tilt = tiltDeg * Math.PI / 180;
  
    entity.onUpdate((go, dt) => {
      phase += speed * dt;
  
      // полярные → декартовы
      const x = radius * Math.cos(phase);
      const z = radius * Math.sin(phase);
      const y = Math.sin(tilt) * z;          // подъём при наклоне
      const z2= z * Math.cos(tilt);          // «сплющенная» проекция
  
      if (center) {
        go.x = center.x + x;
        go.y = center.y + y;
        go.z = center.z + z2;
      } else {
        go.x = x; go.y = y; go.z = z2;
      }
    });
  }
  