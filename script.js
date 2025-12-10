import { ethers } from "ethers";
import chalk from "chalk";

async function transfer() {
    try {
        const privateKey = process.argv[2];
        const amount = process.argv[3];
        const recipient = process.argv[4];

        // Перевірка наявності всіх обов'язкових параметрів
        if (!privateKey || !amount || !recipient) {
            console.log(chalk.red("❌ Ви пропустили обов’язкові параметри:\n"));
            if (!privateKey) console.log(chalk.yellow("PRIVATE_KEY — не введено"));
            if (!amount) console.log(chalk.yellow("AMOUNT — не введено"));
            if (!recipient) console.log(chalk.yellow("RECIPIENT — не введено"));

            console.log("\n" + chalk.green("Приклад запуску:"));
            console.log(chalk.cyan("node script.js <PRIVATE_KEY> <AMOUNT> <RECIPIENT>"));
            process.exit(1);
        }

        // Підключення до RPC провайдера (тестова мережа Sepolia)
        const provider = new ethers.JsonRpcProvider(
            "https://rpc.ankr.com/eth_sepolia/99eb57194b71896d05ddf579887428d14651cb686056735ae1230b16969a0ebc"
        );

        // Створення гаманця
        const wallet = new ethers.Wallet(privateKey, provider);

        // Отримання балансу через провайдера
        const balance = await provider.getBalance(wallet.address);
        console.log("Баланс:", chalk.green(`${ethers.formatEther(balance)} ETH`));

        // Конвертація суми в Wei
        const amountInWei = ethers.parseEther(amount);

        // Перевірка достатності коштів
        if (balance < amountInWei) {
            console.log(chalk.red("❌ Недостатньо коштів для відправки цієї суми!"));
            process.exit(1);
        }

        console.log("Відправка транзакції...");

        const TX = await wallet.sendTransaction({
            to: recipient,
            value: amountInWei
        });

        console.log(chalk.blue("✅ Транзакція відправлена!"));
        console.log("Hash:", chalk.cyan(TX.hash));

        const receipt = await TX.wait();
        console.log("Транзакція підтверджена в блоці:", chalk.green(receipt.blockNumber));

    } catch (err) {
        console.error(chalk.red("❌ Сталася помилка:"), err.message);
    }
}

transfer();
