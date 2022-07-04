// // 0,1,1,2,3,5,8,13
// function fibon(x) {
//   let start = 0;
//   let start2 = 1;
//   let sum = 0;
//   if (x === 1) {
//     console.log(0);
//   } else {
//     for (let i = 0; i < x; i++) {
//       console.log(start);
//       sum = start + start2;
//       start = start2;
//       start2 = sum;
//     }
//   }
// }
// // fibon(10);

// function max(arr) {
//   let max = 0;
//   for (let i = 0; i < arr.length; i++) {
//     if (max < arr[i]) {
//       max = arr[i];
//     }
//   }
//   console.log(max);
// }
// // max(arr);

// const arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 41, 8, 8]; // 5, 41

// function dup(arr) {
//   let newArr = [];
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] != arr[i + 1]) {
//       newArr.push(arr[i]);
//     }
//   }
//   console.log(newArr);
// }

// // dup(arr);

// function polin(str) {
//   let boole = false;
//   let count = 0;
//   for (let i = 0; i < str.length / 2; i++) {
//     if (str[i] === str[str.length - (1 + i)]) {
//       count++;
//     }
//   }
//   if (count == Math.round(str.length / 2)) {
//     boole = true;
//   }
//   return boole;
// }

// // console.log(polin('repape3r'));
