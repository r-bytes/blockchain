import { run } from "hardhat"

export const verify = async (
    contractAddress: string,
    args: any[],
    contractName?: string
): Promise<void> => {
    console.log("=====> verifying contract...")

    try {
        contractName
            ? await run(`verify:verify`, {
                  contract: `contracts/${contractName}.sol:${contractName}`,
                  address: contractAddress,
                  constructorArguments: args,
              })
            : await run(`verify:verify`, {
                  address: contractAddress,
                  constructorArguments: args,
              })
    } catch (error: any) {
        if (error.message.toLowerCase().includes("=====> already verified")) {
            console.log("=====> verification failed")
        } else if (
            error.message
                .toLowerCase()
                .includes(
                    "More than one contract was found to match the deployed bytecode."
                )
        ) {
        } else {
            console.error(error)
        }
    }
}
