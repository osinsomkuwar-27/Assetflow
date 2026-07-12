/**
 * Returns true if [startA, endA) overlaps [startB, endB).
 * Back-to-back slots (endA === startB) are NOT an overlap.
 * e.g. Room booked 9:00-10:00 -> 9:30-10:30 overlaps (rejected), 10:00-11:00 does not (allowed).
 */
function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

module.exports = { rangesOverlap };
