import { msg } from '../i18n';

// Errors raised by the database that customers can see in the error banner.
// Nothing imports this list: it exists so the translation check covers these messages.
export const DATABASE_MESSAGES = [
  msg('You must be signed in to join a chit group'),
  msg('Only active customers can join a chit group'),
  msg('Your KYC must be approved before you can join a chit group'),
  msg('Add a nominee before joining a chit group'),
  msg('Sign the agreement by typing your full name exactly as registered: {name}'),
  msg('Chit group not found'),
  msg('This chit group is not accepting new members'),
  msg('This chit group is already full'),
  msg('A single subscriber can hold at most {count} tickets in this chit group'),
  msg('Auction is not open'),
  msg('Auction not found'),
  msg('This auction is not open for bidding'),
  msg('Bidding opens at {time}'),
  msg('Bid must be between ₹{min} and ₹{max}'),
  msg('Bid must be higher than the current highest bid of ₹{amount}'),
  msg('Only active members who have not already won can bid'),
  msg('This ticket is not part of the auction'),
];
