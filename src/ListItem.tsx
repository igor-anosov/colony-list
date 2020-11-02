import Blockies from 'react-blockies';
import React, {FunctionComponent} from 'react';

interface IListItem {
  block: {
    userAddress: string;
  };
}

export const ListItem: FunctionComponent<IListItem> = ({block, children}) => {
  return(
     <li>
       <Blockies seed={block.userAddress} size={10} scale={3.7} />
       {children}
     </li>
  )
};

export default ListItem;
