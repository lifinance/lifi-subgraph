import { Address } from "@graphprotocol/graph-ts";
import {
  FeesCollected,
  FeesWithdrawn
} from "../generated/FeeCollector/FeeCollector";
import { Integrator, TokenBalance } from "../generated/schema";

export function handleFeesCollected(event: FeesCollected): void {
  const integratorAddress = event.params._integrator;
  const tokenAddress = event.params._token;
  let integrator = getIntegrator(integratorAddress)

  let token = getToken(tokenAddress, integrator)
  
  token.totalCollected = token.totalCollected.plus(event.params._integratorFee);
  token.balance = token.balance.plus(event.params._integratorFee);
  token.feeCollectionsCount = token.feeCollectionsCount + 1;
  token.save();
}
export function handleFeesWithdrawn(event: FeesWithdrawn): void {
  const integratorAddress = event.params._to;
  const tokenAddress = event.params._token;
  let integrator = getIntegrator(integratorAddress)

  let token = getToken(tokenAddress, integrator)

  token.balance = token.balance.minus(event.params._amount);
  token.feeWithdrawalsCount = token.feeWithdrawalsCount + 1;
  token.save();
}

const createNewToken = (tokenAddress: Address, integrator: Integrator): TokenBalance => {
  let token = new TokenBalance(
    tokenAddress.toHex().concat(integrator.address.toHex()),
  );
  token.address = tokenAddress;
  token.integrator = integrator.id;
  token.save();

  return token;
};

const getToken = (tokenAddress: Address, integrator: Integrator): TokenBalance => {
  let token = TokenBalance.load(
    tokenAddress.toHex().concat(integrator.address.toHex()),
  );
  if (token == null) {
    token = createNewToken(tokenAddress, integrator);
  }

  return token;
}

const createNewIntegrator = (integratorAddress: Address): Integrator => {
  let integrator = new Integrator(integratorAddress.toHex());
  integrator.address = integratorAddress;
  integrator.save();

  return integrator;
};

const getIntegrator = (integratorAddress: Address): Integrator => {
  let integrator = Integrator.load(integratorAddress.toHex());
  if (integrator == null) {
    integrator = createNewIntegrator(integratorAddress);
  }

  return integrator;
};
