import mitt from "mitt";

// 🎯 Define tất cả event của app
type AppEvents = {
    NAVIGATE: { url: string; isRefresh?: boolean };

    ADD_TO_CART: { productId: string };

    CART_UPDATED: {
        type: "add" | "remove" | "update" | "clear";
        productId?: string;
    };

    //   SET_INPUT: {
    //     field: "phone" | "name";
    //     value: string;
    //   };

    SET_CHECKOUT_INFO: {
        receiverName?: string;
        receiverPhone?: string;
    };

    SUBMIT_ORDER: {
        source?: "ai" | "manual";
    };

    ORDER_UPDATED: {
        type: "created" | "refresh";
    };

    CLICK_BUTTON: {
        id: "order-btn" | "checkout-btn";
    };

    SHOW_TOAST: { message: string };
};
export const eventBus = mitt<AppEvents>();