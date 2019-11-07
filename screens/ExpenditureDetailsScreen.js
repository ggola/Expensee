import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';

// Redux
import { useSelector, useDispatch } from 'react-redux';
// Dispatch actions
import * as expenditureActions from '../store/actions/expenditures';

// Component
import ExpenditureDetailsCard from '../components/ExpenditureDetailsCard'

import Colors from '../constants/Colors';

const ExpenditureDetailsScreen = props => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();

    const [isLoadingComment, setIsLoadingComment] = useState(false);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [errorComment, setErrorComment] = useState();
    const [errorReceipt, setErrorReceipt] = useState();

    // Retrieve expenditure to showcase
    const expenditureId = props.navigation.getParam('expenditureId');
    const expenditureIndex = props.navigation.getParam('expenditureIndex');
    const expenditure = useSelector((state) => state.expenditures.currentExpenditure);

    // Load expense from expenditureId
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            await dispatch(expenditureActions.getExpenditureFromId(expenditureId));
            setError(null);
            setIsLoading(false);
        } catch (err) {
            // Error rethrown from the dispatch action
            setError(err.message);
            setIsLoading(false);
        }
    }, [dispatch, setIsLoading, setError]);

    useEffect(() => {
        loadData()
    }, [dispatch, loadData]);

    // Shows error alert for networking problems
    useEffect(() => {
        if (!isLoading && error) {
            Alert.alert('There was a problem fetching the expense', error, 
                [
                    {
                        text: 'Try again',
                        style: 'default',
                        onPress: () => loadData()
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => props.navigation.goBack()

                    }
                ]
            );
        }
    }, [isLoading, error]);

    // Dispatch addReceipt action 
    const addReceiptHandler = useCallback(async (imageFile) => {
        setIsLoadingReceipt(true);
        try {
            await dispatch(expenditureActions.addReceipt(expenditureId, expenditureIndex, imageFile));
            Alert.alert('Receipt successfully added!', null, [{ text: 'Got it' }]);
            setIsLoadingReceipt(false);
        } catch (err) {
            setErrorReceipt(err);
            setIsLoadingReceipt(false);
        }
    }, [dispatch, expenditureId, setIsLoadingReceipt, setErrorReceipt]);

    // Dispatch addComment action
    const addCommentHandler = useCallback(async (comment) => {
        setIsLoadingComment(true);
        try {
            await dispatch(expenditureActions.addComment(expenditureId, expenditureIndex, comment));
            Alert.alert('Comment successfully added!', null, [{ text: 'Got it' }]);
            setIsLoadingComment(false);
        } catch (err) {
            setErrorComment(err);
            setIsLoadingComment(false);
        }
    }, [dispatch, expenditureId, setIsLoadingComment, setErrorComment]);

    if (!isLoadingComment && errorComment) {
        Alert.alert(
            'There was a problem adding the comment', null,
            [{
                text: 'Try again',
                onPress: () => {setErrorComment(null)}
            },
            {
                text: 'Cancel'
            }]
        )
    } 

    if (!isLoadingReceipt && errorReceipt) {
        Alert.alert(
            'There was a problem adding the receipt', null,
            [{
                text: 'Try again',
                onPress: () => {setErrorReceipt(null)}
            },
            {
                text: 'Cancel'
            }]
        )
    } 

    return (
        <View style={styles.screen}>
            {error ?
            null
            :
            (isLoading ?
                <View style={styles.screenCentered}>
                    <ActivityIndicator size='large' color={Colors.primary}/>
                </View>
                :
                <View style={styles.detailsCard}>
                    <ExpenditureDetailsCard 
                        amount={expenditure.amount}
                        currency={expenditure.currency}
                        name={expenditure.name}
                        email={expenditure.email}
                        date={expenditure.date}
                        retail={expenditure.retail}
                        comment={expenditure.comment}
                        receipts={expenditure.receipts}
                        addComment={addCommentHandler}
                        isLoadingComment={isLoadingComment}
                        addReceipt={addReceiptHandler}
                        isLoadingReceipt={isLoadingReceipt}
                        navigation={props.navigation}
                    />
                </View>
            )
        }
        </View>
    );
};

ExpenditureDetailsScreen.navigationOptions = {
    headerTitle: 'Expense details'
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    screenCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailsCard: {
        width: '100%', 
        height: '100%'
    }
});

export default ExpenditureDetailsScreen;