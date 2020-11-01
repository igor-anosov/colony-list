import {
  getColonyNetworkClient,
  Network,
  getLogs,
  ColonyRole,
  getBlockTime,
} from '@colony/colony-js';
import {Wallet, utils} from 'ethers';
import {InfuraProvider} from 'ethers/providers';

const MAINNET_NETWORK_ADDRESS = `0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef`;
const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;
const myToken = 'IUAH59DXTP8BDN9WQBCNR76Z5SN8GJ1YEB';

const provider = new InfuraProvider();
const wallet = Wallet.createRandom();

const EventFilters = {
  PayoutClaimed: 'payoutClaimed',
  ColonyInitialised: 'colonyInitialised',
  ColonyRoleSet: 'colonyRoleSet',
  DomainAdded: 'domainAdded',
};

async function getMyClient() {
  try {
    const connectedWallet = wallet.connect(provider);
    const networkClient = await getColonyNetworkClient(
       Network.Mainnet,
       connectedWallet,
       MAINNET_NETWORK_ADDRESS,
    );

    // Get the colony client instance for the betacolony
    return await networkClient.getColonyClient(MAINNET_BETACOLONY_ADDRESS);
  } catch (e) {
    console.error(e);
  }
}

const getReadableAmount = (amount) => {
  const humanReadableAmount = new utils.BigNumber(amount);
  const wei = new utils.BigNumber(10);
  return humanReadableAmount.div(wei.pow(18)).toString();
};

async function getDataByFilter(filter) {
  try {
    const colonyClient = await getMyClient();
    let eventFilter;

    switch(filter) {
      case EventFilters.PayoutClaimed:
        eventFilter = colonyClient.filters.PayoutClaimed();
        break;
      case EventFilters.ColonyInitialised:
        eventFilter = colonyClient.filters.ColonyInitialised();
        break;
      case EventFilters.ColonyRoleSet:
        eventFilter = colonyClient.filters.ColonyRoleSet();
        break;
      case EventFilters.DomainAdded:
        eventFilter = colonyClient.filters.DomainAdded();
        break;
    }
    const eventLogs = await getLogs(colonyClient, eventFilter);
    const parsedLogs = [];

    for await (let event of eventLogs.slice(0, 3)) {
      const parsedEvent = colonyClient.interface.parseLog(event);

      if (filter === EventFilters.ColonyRoleSet || filter === EventFilters.DomainAdded) {
        const humanReadableDomainId = new utils.BigNumber(
           parsedEvent.values.domainId
        ).toString();
        const {associatedTypeId} = await colonyClient.getFundingPot(humanReadableDomainId);
        const {recipient: userAddress} = await colonyClient.getPayment(associatedTypeId);

        parsedLogs.push({...event, ...parsedEvent, humanReadableDomainId, userAddress});
        continue;
      }

      if (filter === EventFilters.PayoutClaimed) {
        const humanReadableFundingPotId = new utils.BigNumber(
           parsedEvent.values.fundingPotId
        ).toString();

        const {associatedTypeId} = await colonyClient.getFundingPot(humanReadableFundingPotId);
        const {recipient: userAddress} = await colonyClient.getPayment(associatedTypeId);
        const humanReadableAmount = getReadableAmount(parsedEvent.values.amount);

        // Didn't manage to get tokens because I don't know which address to pass in.
        // It always gets an error.

        // const token = await fetch(`https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${parsedEvent.value.token}&apikey=${myToken}`)
        //    .then(response => response.json());
        parsedLogs.push({...event, ...parsedEvent, humanReadableAmount, humanReadableFundingPotId, userAddress});
      }

    }

    return parsedLogs;
  } catch (e) {
    console.error(e);
  }
}

export {
  ColonyRole,
  getDataByFilter,
  EventFilters,
};
