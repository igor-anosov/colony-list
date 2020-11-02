import {
  getColonyNetworkClient,
  Network,
  getLogs,
  ColonyRole,
} from '@colony/colony-js';
import {Wallet, utils} from 'ethers';
import {InfuraProvider} from 'ethers/providers';
import {
  ColonyClientV1,
  ColonyClientV2,
  ColonyClientV3,
  ColonyClientV4,
  ContractClient
} from "@colony/colony-js/lib";

interface NetworkClientOptions {
  networkAddress?: string;
  oneTxPaymentFactoryAddress?: string;
  reputationOracleEndpoint?: string;
} {

}

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
       MAINNET_NETWORK_ADDRESS as NetworkClientOptions,
    );

    return await networkClient.getColonyClient(MAINNET_BETACOLONY_ADDRESS);
  } catch (e) {
    console.error(e);
  }
}

const getReadableAmount = (amount: string) => {
  const humanReadableAmount = new utils.BigNumber(amount);
  const wei = new utils.BigNumber(10);
  return humanReadableAmount.div(wei.pow(18)).toString();
};

async function getDataByFilter(filter: string) {
  try {
    const colonyClient: ColonyClientV1 | ColonyClientV2 | ColonyClientV3 | ColonyClientV4 | undefined
       = await getMyClient();
    let eventFilter;

    switch(filter) {
      case EventFilters.PayoutClaimed:
        // @ts-ignore
        eventFilter = colonyClient.filters.PayoutClaimed();
        break;
      case EventFilters.ColonyInitialised:
        // @ts-ignore
        eventFilter = colonyClient.filters.ColonyInitialised();
        break;
      case EventFilters.ColonyRoleSet:
        // @ts-ignore
        eventFilter = colonyClient.filters.ColonyRoleSet();
        break;
      case EventFilters.DomainAdded:
        // @ts-ignore
        eventFilter = colonyClient.filters.DomainAdded();
        break;
    }
    const eventLogs = await getLogs(colonyClient as ContractClient, eventFilter);
    const parsedLogs = [];

    // Have to take only 2 events since Infura often brings a 429th error about
    // request rate exceeded
    for await (let event of eventLogs.slice(0, 2)) {
      const parsedEvent = colonyClient!.interface.parseLog(event);

      if (filter === EventFilters.ColonyRoleSet || filter === EventFilters.DomainAdded) {
        const humanReadableDomainId = new utils.BigNumber(
           parsedEvent.values.domainId
        ).toString();
        const {associatedTypeId} = await colonyClient!.getFundingPot(humanReadableDomainId);
        const {recipient: userAddress} = await colonyClient!.getPayment(associatedTypeId);

        parsedLogs.push({...event, ...parsedEvent, humanReadableDomainId, userAddress});
        continue;
      }

      if (filter === EventFilters.PayoutClaimed) {
        const humanReadableFundingPotId = new utils.BigNumber(
           parsedEvent.values.fundingPotId
        ).toString();

        const {associatedTypeId} = await colonyClient!.getFundingPot(humanReadableFundingPotId);
        const {recipient: userAddress} = await colonyClient!.getPayment(associatedTypeId);
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
