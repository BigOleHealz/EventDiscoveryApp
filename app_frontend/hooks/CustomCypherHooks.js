import { useRef, useState, useEffect } from 'react';
import { useReadCypher, useWriteCypher } from 'use-neo4j'


export const useCustomCypherRead = (query) => {

	const isFirstRender = useRef(true);

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
		if (!params) {
			return;
		}

		const run_query = async () => {
			try {
				const result = await run(params);
				const transformed_records = recordsAsObjects(result.records);
				setTransactionStatus({ STATUS: 'SUCCESS', RESPONSE: { RECORDS: transformed_records, RECORD_COUNT: transformed_records.length } });
			} catch (error) {
				console.error('Error executing useCustomCypherRead');
				setTransactionStatus({ STATUS: 'ERROR', RESPONSE: error.message });
			}
		};
		run_query();
	}, [params]);

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
				console.error('Error executing useCustomCypherRead');
				setTransactionStatus({ STATUS: 'ERROR', RESPONSE: error.message });
				setTransactionRunning(false);
			} else {
				console.log('Something else happened');
				setTransactionRunning(false);
			}
		}
	}, [loading, error, records, transactionRunning]);

	const executeQuery = (new_params) => {
		setParams(new_params);
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
			if (runCommand && params) {
				run(params);
				setRunCommand(false);
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
				console.error('Error executing useCustomCypherWrite');
				setTransactionStatus({ STATUS: 'ERROR', RESPONSE: error.message });
				setTransactionRunning(false);
			} else {
				console.log('Something else happened');
				setTransactionRunning(false);
			}
		}
	}, [loading, error, records, transactionRunning]);

	const executeQuery = (new_params) => {
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
