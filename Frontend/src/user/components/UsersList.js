import React from 'react';

import UserItem from './UserItem';
import Card from '../../shared/components/UIElements/Card';
import './UsersList.css';

const UsersList = props => {
  if (props.items.length === 0) {
    return (
      <div className="center">
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {props.items.map((user, index) => (
        <div 
          key={user.id} 
          className={`user-item ${index % 2 === 0 ? 'float-left-to-right' : 'float-right-to-left'}`}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          <UserItem
            id={user.id}
            image={user.image}
            name={user.name}
            placeCount={user.places.length}
            isAdmin={props.isAdmin}
            onDeleteUser={props.onDeleteUser}
          />
        </div>
      ))}
    </div>
  );
};

export default UsersList;
