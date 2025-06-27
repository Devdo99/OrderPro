// src/components/UpcomingOrdersReminder.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BoxOrder } from "@/types";
import { BellRing, Package } from 'lucide-react';
import { format, isTomorrow, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

interface UpcomingOrdersReminderProps {
  orders: BoxOrder[];
}

export function UpcomingOrdersReminder({ orders }: UpcomingOrdersReminderProps) {
    const upcoming = orders.filter(o => {
        try {
            const pickupDate = new Date(o.pickup_date);
            return isToday(pickupDate) || isTomorrow(pickupDate);
        } catch (e) {
            return false;
        }
    }).sort((a,b) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime());

    if(upcoming.length === 0) return null;

    return (
        <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-yellow-800">Pengingat Pesanan Nasi Kotak</CardTitle>
                <BellRing className="h-4 w-4 text-yellow-700" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                {upcoming.map(order => {
                    const totalQuantity = Array.isArray(order.items)
                        ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                        : 0;

                    let pickupDateText = 'DIJEMPUT HARI INI';
                    try {
                        const date = new Date(order.pickup_date);
                        if(isTomorrow(date)) {
                            pickupDateText = `DIJEMPUT BESOK, ${format(date, 'dd MMM', {locale: id})}`;
                        }
                    } catch (e) {
                        pickupDateText = 'Tanggal tidak valid';
                    }

                    return (
                        <div key={order.id} className="flex items-start gap-3 p-2 rounded-lg bg-yellow-100/50">
                            <Package className="h-5 w-5 mt-1 text-yellow-700 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-900">{order.customer_name} ({totalQuantity} pax)</p>
                                <p className="text-xs text-yellow-800 font-bold">{pickupDateText}</p>
                            </div>
                        </div>
                    );
                })}
                </div>
            </CardContent>
        </Card>
    );
}