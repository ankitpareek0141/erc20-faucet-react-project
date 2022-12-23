import { useState } from "react";

function Body(props) {

    const [data, setData] = useState({ walletAddress: '', amount: 0 });

    async function handelSubmit(e) {
        e.preventDefault();
        console.log("=> ", data);

        try {
        let contract = props.contractObj;

        let gasEstimated = await contract.estimateGas.mint(data.walletAddress, data.amount);
        console.log("gas := ", Number(gasEstimated._hex));

        let txn = await contract.mint(data.walletAddress, data.amount);
        console.log("txn ", txn);
        
        let receipt = await txn.wait();
        console.log("receipt ", receipt);
        } catch(error) {
            console.log("error ", error);
        }
    }

    return (
        <>
            <form onSubmit={handelSubmit}>
                <div className="mb-3">
                    <label htmlFor="walletAddress" className="form-label">Wallet Address</label>
                    <input
                        type="text"
                        className="form-control"
                        id="walletAddress"
                        value={data.walletAddress}
                        onChange={(e) => {
                            data.walletAddress = e.target.value;
                            setData({ walletAddress: e.target.walletAddress, ...data });
                        }
                        }
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="amountToMint" className="form-label">Token Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        id="amountToMint"
                        value={data.amount}
                        onChange={(e) => {
                            setData({ ...data, amount: e.target.value });
                        }
                        }
                    />
                </div>
                <button type="submit" className="btn btn-primary" >Mint</button>
            </form>
        </>
    );
}

export default Body;