import { getWeth } from "./getWeth"

async function main(): Promise<void> {
    // the protocol treats everything as an ERC20 token
    await getWeth()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
