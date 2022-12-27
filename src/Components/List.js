function List(props) {
    return (
        <tbody>
            {props.allTransactions.length == 0 ? (
                <h3 className="text-center fw-lighter">No transactions yet!</h3>
            ) : (
                props.allTransactions.map((transaction) => {
                    let rowType = '';
                    let rowStatus = '';
                    if (transaction.nStatus == -1) {
                        rowType = 'table-danger';
                        rowStatus = 'Failed';
                    } else if (transaction.nStatus == 0) {
                        rowType = 'table-warning';
                        rowStatus = 'Pending';
                    } else if (transaction.nStatus == 1) {
                        rowType = 'table-success';
                        rowStatus = 'Success';
                    }
                    return (
                        <tr className={`${rowType}`} key={transaction._id}>
                            <td scope="col">{transaction.nAmount}</td>
                            <td scope="col">{transaction.sTransactionHash}</td>
                            <td scope="col">{rowStatus}</td>
                        </tr>
                    );
                })
            )}
        </tbody>
    );
}

export default List;
