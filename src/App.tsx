import React, { useEffect, useState } from 'react';
import {
  ColonyRole,
  getDataByFilter,
  EventFilters,
} from './utils';
import Blockies from 'react-blockies';
import styles from './App.module.css';

const myToken = 'IUAH59DXTP8BDN9WQBCNR76Z5SN8GJ1YEB';


type AppState = {
  events: {
    payoutClaimed: any[];
    colonyInitialised: any[];
    colonyRoleSet: any[];
    domains: any[];
  }
  isFetching: boolean;
}

const initialState: AppState = {
  events: {
    payoutClaimed: [],
    colonyInitialised: [],
    colonyRoleSet: [],
    domains: [],
  },
  isFetching: false,
};

function App() {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    setData((state) => ({...state, isFetching: true}));

    getDataByFilter(EventFilters.PayoutClaimed)
      .then((items: any) => {
        if (items) {
          setData(state => {
            return { events: {
              ...state.events,
              payoutClaimed: items,
            },
            isFetching: false,
          }});
        } else {
          console.error('Data is undefined!')
        }
      })
      .catch((error: Error) => console.error(error));
  }, []);

  useEffect(() => {
    setData((state) => ({...state, isFetching: true}));

    getDataByFilter(EventFilters.ColonyRoleSet)
       .then((items: any) => {
         if (items) {
          setData(state => {
            return { events: {
              ...state.events,
              colonyRoleSet: items,
            },
            isFetching: false,
          }});
         } else {
           console.error('Data is undefined!')
         }
       })
       .catch((error: Error) => console.error(error));
  }, []);

  useEffect(() => {
    setData((state) => ({...state, isFetching: true}));

    getDataByFilter(EventFilters.DomainAdded)
       .then((items: any) => {
         if (items) {
          setData(state => {
            return { events: {
              ...state.events,
              domains: items,
            },
            isFetching: false,
          }});
         } else {
           console.error('Data is undefined!')
         }
       })
       .catch((error: Error) => console.error(error));
  }, []);

  useEffect(() => {
    console.log('---data.events.', data.events.payoutClaimed[0])
  }, [data]);

  return (
    <div>
      <ul className={styles.list} data-testid="list">
        {data.isFetching && <li>...Loading</li>}
        {!data.isFetching && (
           data.events.payoutClaimed.map(block => {
             return (
                <li key={block.blockNumber + block.transactionIndex}>
                  <Blockies seed={block.userAddress} size={10} scale={3.7} />
                  <p>User <b>{block.userAddress}</b> claimed <b>{block.humanReadableAmount}</b>&nbsp;
                    payout from pot <b>{block.humanReadableFundingPotId}</b></p>
                </li>
             )
           }))
        }
        {!data.isFetching && (
           data.events.colonyRoleSet.map(block => {
             return (
                <li key={block.blockNumber + block.transactionIndex}>
                  <Blockies seed={block.userAddress} size={10} scale={3.7} />
                  <p><b>{ColonyRole[block.values.role]}</b> role assigned to user <b>{block.userAddress}</b>&nbsp;
                    in domain <b>{block.humanReadableDomainId}</b></p>
                </li>
             )
           }))
        }
        {!data.isFetching && (
           data.events.domains.map(block => {
             return (
                <li key={block.blockNumber + block.transactionIndex}>
                  <Blockies seed={block.userAddress} size={10} scale={3.7} />
                  <p>Domain <b>{block.humanReadableDomainId}</b> added</p>
                </li>
             )
           }))
        }
      </ul>
    </div>
  );
}

export default App;
