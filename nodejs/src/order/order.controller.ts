import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../auth/get-user.decorator";
import { ValidationPipe } from "../shared/validation.pipe";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { OrderService } from "./order.service";

@Controller("order")
@UsePipes(new ValidationPipe())
@UseGuards(AuthGuard("jwt"))
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: CreateOrderDTO, @GetUser() user) {
    return this.orderService.createOrder(data, user);
  }

  @Get()
  async getOrderByUser(@GetUser() user) {
    return this.orderService.getOrderByUser(user);
  }

  @Patch("/extention/:orderId")
  async extendOrderTime(
    @Param("orderId") orderId: number,
    @Body("timeToExtend") timeToExtend: string,
  ) {
    return this.orderService.extendOrderTime(orderId, timeToExtend);
  }

  @Patch("/cancel/:orderId")
  async cancelOrder(@Param("orderId") orderId: number, @GetUser() user) {
    return this.orderService.cancelOrder(orderId, user);
  }
}
