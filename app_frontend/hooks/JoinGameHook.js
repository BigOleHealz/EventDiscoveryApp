import { useState, useEffect } from 'react';
import { useWriteCypher } from 'use-neo4j';
import { toast } from 'react-toastify';

import { CREATE_ATTEND_EVENT_RELATIONSHIP } from '../db/queries'

export const useJoinGame = (userSession) => {
    const [runJoinGameQuery, setRunJoinGameQuery] = useState(false);
    const [joinGameUUID, setJoinGameUUID] = useState(null);
  
    const { loading, error, records, run } = useWriteCypher(CREATE_ATTEND_EVENT_RELATIONSHIP);
  
    useEffect(() => {
      const attend_event = async () => {
        if (runJoinGameQuery) {
          const params = {
            EventUUID: joinGameUUID,
            ATTENDEE_UUID: userSession.UUID,
          };
          console.log('params', params);
          run(params);
  
          setRunJoinGameQuery(false);
        }
      };
      attend_event();
    }, [runJoinGameQuery]);
  
    useEffect(() => {
      if (loading) {
        toast.info('Joining game...');
      } else if (records) {
        toast.success('You Joined A Game!');
      } else if (error) {
        toast.error(`Error: ${error.message}`);
      }
    }, [loading, error, records]);
  
    const joinGame = (eventUUID) => {
      console.log('handleJoinGameButtonClick', eventUUID);
      setJoinGameUUID(eventUUID);
      setRunJoinGameQuery(true);
    };
  
    return { joinGame };
  };
  