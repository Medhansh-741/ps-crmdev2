import { parseLocationToLatLng } from "./lib/parse-location";

const hex = "0101000020E61000004C378941604D5340B003E78C289D3C40";
const result = parseLocationToLatLng(hex);
console.log("Result:", result);
