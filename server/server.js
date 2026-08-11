import {app} from './index.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

