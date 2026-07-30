import { Request, Response } from "express";
import { PaymentCallbackService } from "../services/paymentCallbackService";

export class PaymentController {
  constructor(private readonly paymentCallbackService: PaymentCallbackService) {}

  public vnpayIpn = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentCallbackService.processVnpayIpn(req.query);
    res.status(200).json({ RspCode: result.rspCode, Message: result.message });
  };
}
