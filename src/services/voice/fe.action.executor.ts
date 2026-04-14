import { addToCart, clearCart, toggleItemSelect } from "@/db/services/cartService";
import { updateLocationApi } from "@/utils/api.auth";
import { eventBus } from "@/utils/eventBus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const executeFEActionsBefore = async (
    actions: IAction[],
    deps: {
        setAppState: (v: any) => void;
    }
) => {
    const results: IAction[] = [];

    const db = await SQLite.openDatabaseAsync("app.db");
    for (const action of actions) {
        try {
            switch (action.type) {
                case "REQUEST_LOCATION": {
                    const { status } = await Location.requestForegroundPermissionsAsync();

                    if (status !== "granted") {
                        results.push({
                            ...action,
                            status: "failed",
                            error: "Permission denied",
                        });
                        break;
                    }

                    const pos = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });

                    const payload = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    };

                    const res = await updateLocationApi(payload);
                    if (!res.error && res.data) {
                        const token = (await AsyncStorage.getItem("access_token")) ?? "";
                        deps.setAppState({ ...res.data, access_token: token });
                    }

                    results.push({
                        ...action,
                        status: "success",
                        payload,
                    });
                    break;
                }

                case "GET_CART": {
                    const items = await db.getAllAsync("SELECT * FROM cart_items;");
                    const shops = await db.getAllAsync("SELECT * FROM cart_shops;");

                    results.push({
                        ...action,
                        status: "success",
                        payload: {
                            items,
                            shops,
                        },
                    });
                    break;
                }

                case "CLEAR_CART": {
                    await clearCart();
                    results.push({
                        ...action,
                        status: "success",
                    });
                    break;
                }

                default:
                    results.push({
                        ...action,
                        status: "failed",
                        error: "Unknown FE action",
                    });
            }
        } catch (err) {
            results.push({
                ...action,
                status: "failed",
                error: String(err),
            });
        }
    }

    return results;
};

export const executeFEActionsAfter = async (actions: IAction[]) => {
    for (const action of actions) {
        try {
            if (action.delay && action.delay > 0) {
                await sleep(action.delay);
            }

            switch (action.type) {
                case "NAVIGATE": {
                    if (!action.payload || typeof action.payload.url !== "string") {
                        console.warn("Invalid NAVIGATE payload", action);
                        continue;
                    }

                    eventBus.emit("NAVIGATE", {
                        url: action.payload.url,
                        isRefresh: !!action.payload.isRefresh,
                    });

                    //@ts-ignore
                    router.push(action.payload.url);
                    break;
                }

                case "ADD_TO_CART": {
                    const p = action.payload;

                    if (!p) {
                        console.warn("Invalid payload ADD_TO_CART");
                        continue;
                    }

                    console.log("Adding to cart:", p);

                    const addedItem = await addToCart({
                        shopId: p.shopId,
                        shopName: p.shopName,
                        productId: p.productId,
                        productName: p.productName,
                        basePrice: p.basePrice,
                        sizePrice: p.sizePrice || 0,
                        toppingPrice: p.toppingPrice || 0,
                        quantity: p.quantity || 1,
                        sizeId: p.sizeId || "",
                        sizeName: p.sizeName || "",
                        toppingIds: p.toppingIds || [],
                        toppingNames: p.toppingNames || [],
                        image: p.image || ""
                    });

                    await toggleItemSelect(addedItem.id, true);

                    eventBus.emit("CART_UPDATED", {
                        type: "add",
                        productId: p.productId,
                    });

                    eventBus.emit("SHOW_TOAST", {
                        message: "Đã thêm vào giỏ hàng 🛒✨"
                    });
                    break;
                }

                case "SET_CHECKOUT_INFO": {
                    eventBus.emit("SET_CHECKOUT_INFO", {
                        receiverName: action.payload?.receiverName,
                        receiverPhone: action.payload?.receiverPhone,
                    });
                    break;
                }

                case "SUBMIT_ORDER": {
                    eventBus.emit("SUBMIT_ORDER", {
                        source: "ai",
                    });
                    break;
                }

                default:
                    console.warn("Unknown FE action:", action);
            }
        } catch (err) {
            console.error(`FE action error [${action.type}]`, err);
        }
    }
};