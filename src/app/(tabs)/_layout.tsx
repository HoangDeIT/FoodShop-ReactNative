import { APP_COLOR } from '@/utils/constant';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { ReactNode } from 'react';
const TabLayout = () => {
    const getIcon = (routeName: string,
        focus: boolean,
        color: string,
        size: number): ReactNode => {
        if (routeName === "index") {
            return (
                <MaterialCommunityIcons
                    name="food-fork-drink"
                    size={24}
                    color={focus ? APP_COLOR.ORANGE : APP_COLOR.GREY} />)
        }
        if (routeName === "order") {
            return (
                <MaterialIcons
                    name="list-alt"
                    size={size}
                    color={focus ? APP_COLOR.ORANGE : APP_COLOR.GREY}
                />)
        }
        if (routeName === "favorite") {
            return (
                focus ?
                    <AntDesign
                        name="heart"
                        size={size}
                        color={APP_COLOR.ORANGE}
                    />
                    :
                    <AntDesign
                        name="heart"
                        size={size}
                        color={APP_COLOR.GREY}
                    />)
        }
        if (routeName === "cart") {
            return (
                <MaterialCommunityIcons
                    name={focus ? "cart" : "cart-outline"}
                    size={size}
                    color={focus ? APP_COLOR.ORANGE : APP_COLOR.GREY}
                />
            );
        }

        if (routeName === "account") {
            return (
                <Ionicons
                    name={focus ? "person-circle" : "person-circle-outline"}
                    size={size}
                    color={focus ? APP_COLOR.ORANGE : APP_COLOR.GREY}
                />
            );
        }

        return <></>
    }
    return (

        <Tabs screenOptions={({ route }) => ({
            tabBarLabelStyle: { paddingBottom: 3 },
            tabBarActiveTintColor: APP_COLOR.ORANGE,
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => getIcon(route.name, focused, color, size)

        })}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home"
                }}
            />
            <Tabs.Screen
                name="order"
                options={{
                    title: "Đơn hàng"
                }}
            />
            <Tabs.Screen
                name="favorite"
                options={{
                    title: "Đã thích"
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: "Tôi"
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                }}
            />
        </Tabs>
    );
}
export default TabLayout