import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './UserItem.css';

const UserItem = props => {
  return (
    <div className="user-item">
      <Card className="user-item__content">
        <Link to={`/${props.id}/places`}>
          <div className="user-item__image">
            <Avatar image={props.image} alt={props.name} />
          </div>
          <div className="user-item__info">
            <h2>{props.name}</h2>
            <div className="user-item__places">
              {props.placeCount} {props.placeCount === 1 ? 'Place' : 'Places'}
            </div>
          </div>
        </Link>
        {props.isAdmin && (
          <button className="admin-delete-btn" onClick={() => props.onDeleteUser(props.id)}>
            Delete
          </button>
        )}
      </Card>
    </div>
  );
};

export default UserItem;
