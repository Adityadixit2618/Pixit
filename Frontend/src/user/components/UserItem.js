import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import { ASSET_URL } from '../../config';
import './UserItem.css';

const UserItem = props => {
  return (
    <div className="user-item">
      <Card className="user-item__content">
        <Link to={`/${props.id}/places`}>
          <div className="user-item__image">
            <Avatar image={`${ASSET_URL}/${props.image}`} alt={props.name} />
          </div>
          <div className="user-item__info">
            <h2>{props.name}</h2>
            <div className="user-item__places">
              places: {props.placeCount}
            </div>
          </div>
        </Link>
      </Card>
    </div>
  );
};

export default UserItem;
