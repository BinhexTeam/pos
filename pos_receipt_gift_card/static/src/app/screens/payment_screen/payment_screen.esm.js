/** @odoo-module */

import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    async _postPushOrderResolve(order, server_ids) {
        var res = super._postPushOrderResolve(order, server_ids);
        if (order.server_id) {
            const {program_by_id} = this.pos;
            const program_gifts = [];
            Object.values(order.couponPointChanges).reduce((agg, pe) => {
                const program = program_by_id[pe.program_id];
                if (program.program_type === "gift_card") {
                    program_gifts.push(pe.program_id);
                }
                return agg;
            }, {});

            var domain = [
                ["source_pos_order_id", "=", order.server_id],
                ["program_id", "in", program_gifts],
            ];
            order.giftCardData = await this.orm.searchRead("loyalty.card", domain, [
                "id",
                "code",
                "points_display",
            ]);
        }
        return res;
    },
});
