import {config} from "dotenv"
import { App } from './Core/App';

config();

async function bootstrap() {
    try {
        const app = App.getInstance();
        await app.start();
    }
    catch (error) {
        console.error('Failed to bootstrap application:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', async () => {
    const app = App.getInstance();
    await app.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    const app = App.getInstance();
    await app.stop();
    process.exit(0);
});

bootstrap().catch((error) => {
    process.exit(1);
});