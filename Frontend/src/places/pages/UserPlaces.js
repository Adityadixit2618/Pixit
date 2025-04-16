import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { API_BASE_URL } from '../../config';

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${API_BASE_URL}/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places || []);
      } catch (err) {
        // If the error is "Could not find places", treat as empty list, suppress error modal
        if (err.message && err.message.includes('Could not find places')) {
          setLoadedPlaces([]);
        }
        // For other errors, the error state will be handled by useHttpClient
      }
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = deletedPlaceId => {
    setLoadedPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletedPlaceId)
    );
  };

  // Only show ErrorModal if error is present and not the "no places" message
  const shouldShowError = error && !error.includes('Could not find places');

  return (
    <React.Fragment>
      <ErrorModal 
        error={shouldShowError ? error : null} 
        onClear={clearError} 
      />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />}
    </React.Fragment>
  );
};

export default UserPlaces;
