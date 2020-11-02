import React, { useEffect, useState } from 'react';
import {
  ColonyRole,
  getDataByFilter,
  EventFilters,
} from './utils';
import styles from './App.module.css';
import ListItem from "./ListItem";

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

  return (
    <div>
      <ul className={styles.list} data-testid="list">
        {data.isFetching && <li>...Loading</li>}
        {!data.isFetching && (
           data.events.payoutClaimed.map(block => {
             return (
                <ListItem block={block} key={block.blockNumber + block.transactionIndex}>
                  <p>User <b>{block.userAddress}</b> claimed <b>{block.humanReadableAmount}</b>&nbsp;
                    payout from pot <b>{block.humanReadableFundingPotId}</b></p>
                </ListItem>
             )
           }))
        }
        {!data.isFetching && (
           data.events.colonyRoleSet.map(block => {
             return (
                <ListItem block={block} key={block.blockNumber + block.transactionIndex}>
                  <p><b>{ColonyRole[block.values.role]}</b> role assigned to user <b>{block.userAddress}</b>&nbsp;
                    in domain <b>{block.humanReadableDomainId}</b></p>
                </ListItem>
             )
           }))
        }
        {!data.isFetching && (
           data.events.domains.map(block => {
             return (
                <ListItem block={block} key={block.blockNumber + block.transactionIndex}>
                  <p>Domain <b>{block.humanReadableDomainId}</b> added</p>
                </ListItem>
             )
           }))
        }
      </ul>
    </div>
  );
}

export default App;
