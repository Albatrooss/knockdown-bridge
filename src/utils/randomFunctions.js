

export const shuffle = arr => {
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

export const sortOrder = (me, arr, order) => {
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

export const dealOneCardEach = (users = [{ hand: [] }], deck = []) => {
  users.forEach(user => {
    let hand = user.hand;
    hand.push(deck.pop());
  })
  return { newUsers: users, newDeck: deck }
}

const trumps = ['c', 'd', 'h', 's', 'n'];

export const wonTrick = (played, trump) => {
  let leadSuit = played[0].card[0];
  let pointsArr = played.map(cu => {
    let point;
    let c = cu.card;
    switch (c[c.length - 1]) {
      case 'A':
        point = 13;
        break;
      case 'K':
        point = 12;
        break;
      case 'Q':
        point = 11;
        break;
      case 'J':
        point = 10;
        break;
      case '0':
        point = 9;
        break;
      case '9':
        point = 8;
        break;
      case '8':
        point = 7;
        break;
      case '7':
        point = 6;
        break;
      case '6':
        point = 5;
        break;
      case '5':
        point = 4;
        break;
      case '4':
        point = 3;
        break;
      case '3':
        point = 2;
        break;
      case '2':
        point = 1;
        break;
    }
    if (c[0] === trumps[trump]) {
      point += 15;
    } else if (c[0] !== leadSuit) {
      point = 0;
    }
    return point;
  })
  let winningIndex = pointsArr.indexOf(Math.max(...pointsArr));
  return played[winningIndex].user;
}

export const followSuit = (hand, lead, index) => {
  if (!lead) return true
  let suitHand = hand.map(c => c[0]);
  if (suitHand.includes(lead.card[0])) {
    return suitHand[index] === lead.card[0] ? true : false
  }
  return true
}


// let us = [{ hand: [] }, { hand: [] }];
// let deck = ['s02', 'sA', 'sK', 'dA', 'dK'];

// let { newUsers = us, newDeck = deck } = dealOneCardEach(us, deck);
// { newUsers = us, newDeck = deck } = dealOneCardEach(us, deck);
// console.log("us: ", us);
// console.log(sortOrder('adam', [{ id: 'tim', hand: [] }, { id: 'caitlin', hand: [] }, { id: 'andrew', hand: [] }, { id: 'adam', hand: [] }, { id: 'kyla', hand: [] }, { id: 'hannah', hand: [] }], ['caitlin', 'hannah', 'andrew', 'adam', 'tim', 'kyla']))

// console.log(wonTrick([{ card: 'h06', user: 'Caitlin' }, { card: 'h07', user: 'Tim' }], 4));

// console.log(followSuit(['cA', 'dA'], 's', 0))
