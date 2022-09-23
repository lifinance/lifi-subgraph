import {
  FeesCollected,
  FeesWithdrawn
} from "../generated/FeeCollector/FeeCollector";
import { Integrator, TokenBalance } from "../generated/schema";

export function handleFeesCollected(event: FeesCollected): void {
  const toAddress = event.params._integrator;
  const tokenAddress = event.params._token;
  let toUser = Integrator.load(toAddress.toHex());
  if (toUser == null) {
    toUser = new Integrator(toAddress.toHex());
    toUser.address = toAddress;
    toUser.save();
  }

  let token = TokenBalance.load(tokenAddress.toHex().concat(toAddress.toHex()));
  if (token == null) {
    token = new TokenBalance(tokenAddress.toHex().concat(toAddress.toHex()));
    token.address = tokenAddress;
    token.integrator = toUser.id;
    token.save();
  }
  token.totalCollected = token.totalCollected.plus(event.params._integratorFee);
  token.balance = token.balance.plus(event.params._integratorFee);
  token.feeCollectionsCount = token.feeCollectionsCount + 1;
  token.save();
}
export function handleFeesWithdrawn(event: FeesWithdrawn): void {
  const toAddress = event.params._to;
  const tokenAddress = event.params._token;
  let toUser = Integrator.load(toAddress.toHex());
  if (toUser == null) {
    toUser = new Integrator(toAddress.toHex());
    toUser.address = toAddress;
    toUser.save();
  }

  let token = TokenBalance.load(tokenAddress.toHex().concat(toAddress.toHex()));
  if (token == null) {
    token = new TokenBalance(tokenAddress.toHex().concat(toAddress.toHex()));
    token.address = tokenAddress;
    token.integrator = toUser.id;
    token.save();
  }

  token.balance = token.balance.minus(event.params._amount);
  token.feeWithdrawalCount = token.feeWithdrawalCount + 1;
  token.save();
}
