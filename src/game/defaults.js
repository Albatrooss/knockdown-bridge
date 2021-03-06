export const starterDeck = [
  'dA',
  'dK',
  'dQ',
  'dJ',
  'd10',
  'd09',
  'd08',
  'd07',
  'd06',
  'd05',
  'd04',
  'd03',
  'd02',
  'cA',
  'cK',
  'cQ',
  'cJ',
  'c10',
  'c09',
  'c08',
  'c07',
  'c06',
  'c05',
  'c04',
  'c03',
  'c02',
  'hA',
  'hK',
  'hQ',
  'hJ',
  'h10',
  'h09',
  'h08',
  'h07',
  'h06',
  'h05',
  'h04',
  'h03',
  'h02',
  'sA',
  'sK',
  'sQ',
  'sJ',
  's10',
  's09',
  's08',
  's07',
  's06',
  's05',
  's04',
  's03',
  's02',
]

const gridTemplates = [
  null,
  '". . . . ." ". c c c ." "o0 c c c ." ". c c c ." "me me me me me"',
  '". . o1 . ." ". c c c ." "o0 c c c ." ". c c c ." "me me me me me"',
  '". . o1 . ." ". c c c ." "o0 c c c o2" ". c c c ." "me me me me me"',
  '". . o2 . ." "o1 c c c ." ". c c c o3" "o0 c c c ." "me me me me me"',
  '". o2 . o3 ." "o1 c c c ." ". c c c o4" "o0 c c c ." "me me me me me"',
  '". o2 . o3 ." "o1 c c c o4" ". c c c ." "o0 c c c o5" "me me me me me"',
  '". o3 . o4 ." "o2 c c c o5" "o1 c c c ." "o0 c c c o6" "me me me me me"',
  '". o3 o4 o5 ." "o2 c c c o6" "o1 c c c ." "o0 c c c o7" "me me me me me"',
  '". o3 o4 o5 ." "o2 c c c o6" "o1 c c c o7" "o0 c c c o8" "me me me me me"',
]

const playTemplates = [
  null,
  '". . . . . . ." ". . . p0 . . ." ". . . . . . ." ". . . . . . ." ". . . . . . ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . . p1 . . ." ". . . . . . ." ". p0 . . . . ." ". . . . . . ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . . p1 . . ." ". . . . . . ." ". p0 . . . p2 ." ". . . . . . ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . . p2 . . ." ". p1 . . . . ." ". . . . . p3 ." ". p0 . . . . ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . p2 . p3 . ." ". p1 . . . . ." ". . . . . p4 ." ". p0 . . . . ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . p2 . p3 . ." ". p1 . . . p4 ." ". . . . . . ." ". p0 . . . p5 ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . p3 . p4 . ." ". p2 . . . p5 ." ". p1 . . . . ." ". p0 . . . p6 ." ". . . me . . ." ". . . . . . ."',
  '". . . . . . ." ". . p3 p4 p5 . ." ". p2 . . . p6 ." ". p1 . . . . ." ". p0 . . . p7 ." ". . . me . . ." ". . . . . . ."',
]

export const seatPositions = [
  [],
  [4],
  [1, 4],
  [1, 4, 7],
  [0, 2, 4, 7],
  [0, 2, 3, 5, 7],
  [0, 2, 3, 5, 6, 8],
  [0, 1, 2, 3, 5, 6, 8],
  [0, 1, 2, 3, 4, 5, 6, 8],
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
]

export const trumpOrder = [
  'clubs', 'diamonds', 'hearts', 'spades', 'no trump'
]

export const defaultUser = { 
  bet: '?',
  hand: [],
  host: false, 
  points: 0, 
  tricks: 0,
  wins: 0,
  turn: false, 
}

export default {
  starterDeck,
  gridTemplates,
  playTemplates,
  trumpOrder,
  seatPositions
}