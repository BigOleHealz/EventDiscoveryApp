import { useState, useEffect } from 'react';
import { useReadCypher, useWriteCypher } from 'use-neo4j'


export const useCustomCypherRead = (query) => {

	const transaction_idle = { STATUS: 'IDLE', RESPONSE: null };

	const [params, setParams] = useState(null);
	const [runQuery, setRunQuery] = useState(false);
	const [transactionRunning, setTransactionRunning] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState(transaction_idle);
	const { loading, error, records, run } = useReadCypher(query);

	const resetTransactionStatus = () => {
		setParams(null);
		setTransactionStatus(transaction_idle);
	};

	useEffect(() => {
		const run_query = async () => {
			console.log("runQuery: ", runQuery);
			console.log("params: ", params);
			if (runQuery && params) {
				run(params);
				setRunQuery(false);
				// setTransactionStatus({ STATUS: 'PENDING', RESPONSE: null });
				setTransactionRunning(true);
			}
		};
		run_query();
	}, [runQuery, params]);

	useEffect(() => {
		if (transactionRunning) {
			if (records) {
				const transformed_records = recordsAsObjects(records);
				setTransactionStatus({ STATUS: 'SUCCESS', RESPONSE: { RECORDS: transformed_records, RECORD_COUNT: transformed_records.length } });
				setTransactionRunning(false);
			} else if (loading) {
				console.log('useCustomCypherRead loading...');
				setTransactionStatus({ STATUS: 'PENDING', RESPONSE: null });
			} else if (error) {
				console.error('Error executing useCustomCypherRead:', error);
				setTransactionStatus({ STATUS: 'ERROR', RESPONSE: error.message });
				setTransactionRunning(false);
			}  else {
				console.log('Something else happened');
				setTransactionRunning(false);
			}
		}
	}, [loading, error, records, transactionRunning]);

	const executeQuery = (new_params) => {
		console.log("useCustomCypherRead params: ", new_params);
		setParams(new_params);
		setRunQuery(true);
	};

	return { transactionStatus, executeQuery, resetTransactionStatus };
};





export const useCustomCypherWrite = (query) => {

	const transaction_idle = { STATUS: 'IDLE', RESPONSE: null };

	const [params, setParams] = useState(null);
	const [runCommand, setRunCommand] = useState(false);
	const [transactionRunning, setTransactionRunning] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState(transaction_idle);
	const { loading, error, records, run } = useWriteCypher(query);

	const resetTransactionStatus = () => {
		setParams(null);
		setTransactionStatus(transaction_idle);
	};

	useEffect(() => {
		const run_query = async () => {
			console.log("runCommand: ", runCommand);
			console.log("params: ", params);
			if (runCommand && params) {
				run(params);
				setRunCommand(false);
				// setTransactionStatus({ STATUS: 'PENDING', RESPONSE: null });
				setTransactionRunning(true);
			}
		};
		run_query();
	}, [runCommand, params]);

	useEffect(() => {
		if (transactionRunning) {
			if (records) {
				const transformed_records = recordsAsObjects(records);
				setTransactionStatus({ STATUS: 'SUCCESS', RESPONSE: { RECORDS: transformed_records, RECORD_COUNT: transformed_records.length } });
				setTransactionRunning(false);
			} else if (loading) {
				console.log('useCustomCypherWrite loading...');
				setTransactionStatus({ STATUS: 'PENDING', RESPONSE: null });
			} else if (error) {
				console.error('Error executing useCustomCypherWrite:', error);
				setTransactionStatus({ STATUS: 'ERROR', RESPONSE: error.message });
				setTransactionRunning(false);
			}  else {
				console.log('Something else happened');
				setTransactionRunning(false);
			}
		}
	}, [loading, error, records, transactionRunning]);

	const executeQuery = (new_params) => {
			console.log("useCustomCypherRead params: ", new_params);
			setParams(new_params);
			setRunCommand(true);
	};

	return { transactionStatus, executeQuery, resetTransactionStatus };
};




function recordToObject(object) {
	const obj = {};
	for (let i = 0; i < object.keys.length; i++) {
		obj[object.keys[i]] = object._fields[i];
	}
	return obj;
}
  

const recordsAsObjects = (objects) => {
	return objects.map(object => recordToObject(object))
};
