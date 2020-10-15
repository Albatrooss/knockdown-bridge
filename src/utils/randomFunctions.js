const shuffle = arr => {
  let current = arr.length, temp, random;

  while (current !== 0) {
    random = Math.floor(Math.random() * current);
    current--;

    temp = arr[current];
    arr[current] = arr[random];
    arr[random] = temp
  }
  return arr
}

const sortOrder = (me, arr, order) => {
  let filled = order.map(x => arr.find(y => y.id === x))
  let found = false;
  order.forEach(o => {
    if (!found) {
      let temp = filled.shift();
      if (o === me) {
        found = true;
        return
      }
      filled.push(temp);
    }
  })
  return filled
}

module.exports = {
  shuffle,
  sortOrder
}

// console.log(sortOrder('adam', [{ id: 'tim', hand: [] }, { id: 'caitlin', hand: [] }, { id: 'andrew', hand: [] }, { id: 'adam', hand: [] }, { id: 'kyla', hand: [] }, { id: 'hannah', hand: [] }], ['caitlin', 'hannah', 'andrew', 'adam', 'tim', 'kyla']))