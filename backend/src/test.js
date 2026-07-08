const dayjs = require("dayjs");

console.log(dayjs().format("YYYY-MM-DD"));

console.log(dayjs().add(8, "d").format("YYYY-MM-DD"));

let s = "5235a";
console.log(s[s.length - 1]);

console.log(dayjs() > dayjs().add(1, "s"));