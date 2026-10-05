import mongoose from 'mongoose';
export interface IFAQ {
    question: string;
    answer: string;
    category: string;
    order: number;
    status: 'active' | 'inactive';
}
export declare const FAQ: mongoose.Model<any, {}, {}, {}, any, any>;
