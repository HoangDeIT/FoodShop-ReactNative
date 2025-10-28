import { APP_COLOR } from '@/utils/constant';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
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
        if (routeName === "account") {
            return (
                focus ?
                    <Octicons name="bell-fill"
                        size={size}
                        color={APP_COLOR.ORANGE}
                    />
                    :
                    <Octicons name="bell"
                        size={size}
                        color={APP_COLOR.GREY}
                    />
            )
        }
        if (routeName === "cart") {
            return (
                focus ?
                    <Octicons name="bell-fill"
                        size={size}
                        color={APP_COLOR.ORANGE}
                    />
                    :
                    <Octicons name="bell"
                        size={size}
                        color={APP_COLOR.GREY}
                    />
            )
        }
        // if (routeName === "notification") {
        //     return (
        //         focus ?
        //             <MaterialCommunityIcons name="account" size={size} color={APP_COLOR.ORANGE} />
        //             :
        //             <MaterialCommunityIcons name="account-outline" size={size} color={APP_COLOR.GREY} />
        //     )
        // }
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
            {/* <Tabs.Screen
                name="notification"
                options={{
                    title: "Thông báo"
                }}
            /> */}

            <Tabs.Screen
                name="account"
                options={{
                    title: "Tôi"
                }}
            />
            {/* <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            /> */}
        </Tabs>
    );
}
export default TabLayout