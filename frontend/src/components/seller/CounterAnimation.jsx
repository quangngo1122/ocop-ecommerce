import { useState, useEffect } from "react";

// export default function useCounterAnimation(target, speed = 50) {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     if (target > 0) {
//       let current = 0;
//       const interval = setInterval(() => {
//         current++;
//         setValue(current);
//         if (current >= target) clearInterval(interval);
//       }, speed);

//       return () => clearInterval(interval);
//     }
//   }, [target, speed]);

//   return value;
// }

export default function useCounterAnimation(target, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target > 0) {
      let start = 0;
      const frameRate = 30; // số lần update mỗi giây
      const totalFrames = Math.round((duration / 1000) * frameRate);
      const increment = target / totalFrames;
      let currentFrame = 0;

      const interval = setInterval(() => {
        currentFrame++;
        start += increment;
        if (currentFrame >= totalFrames) {
          setValue(target); // kết thúc -> gán đúng giá trị
          clearInterval(interval);
        } else {
          setValue(Math.floor(start));
        }
      }, 1000 / frameRate);

      return () => clearInterval(interval);
    } else {
      setValue(0);
    }
  }, [target, duration]);

  return value;
}
