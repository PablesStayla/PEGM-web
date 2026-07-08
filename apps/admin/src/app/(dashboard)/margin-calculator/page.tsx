'use client';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@pranakaia/ui';
import { AlertTriangle, CheckCircle2, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function MarginCalculatorPage() {
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [taxRate, setTaxRate] = useState('19');

  const salePriceNum = parseFloat(salePrice) || 0;
  const costPriceNum = parseFloat(costPrice) || 0;
  const shippingCostNum = parseFloat(shippingCost) || 0;
  const platformFeeNum = parseFloat(platformFee) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;

  const taxAmount = salePriceNum * (taxRateNum / 100);
  const totalCost = costPriceNum + shippingCostNum + platformFeeNum + taxAmount;
  const margin = salePriceNum - totalCost;
  const marginPercent = salePriceNum > 0 ? (margin / salePriceNum) * 100 : 0;
  const minMarginRequired = salePriceNum * 0.05;
  const meetsRequirement = margin >= minMarginRequired;

  const reset = () => {
    setSalePrice('');
    setCostPrice('');
    setShippingCost('');
    setPlatformFee('');
    setTaxRate('19');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calculadora de Márgenes</h1>
          <p className="text-muted-foreground">
            Calcula márgenes netos considerando costos, envíos, comisiones e impuestos
          </p>
        </div>
        <Button variant="outline" onClick={reset}>
          Resetear
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entradas</CardTitle>
            <CardDescription>Ingresa los valores para calcular el margen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Precio de Venta ($)</Label>
              <Input
                id="salePrice"
                type="number"
                value={salePrice}
                onChange={(e: any) => setSalePrice(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Costo del Producto ($)</Label>
              <Input
                id="costPrice"
                type="number"
                value={costPrice}
                onChange={(e: any) => setCostPrice(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">Costo de Envío ($)</Label>
              <Input
                id="shippingCost"
                type="number"
                value={shippingCost}
                onChange={(e: any) => setShippingCost(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformFee">Comisión de Plataforma ($)</Label>
              <Input
                id="platformFee"
                type="number"
                value={platformFee}
                onChange={(e: any) => setPlatformFee(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Impuesto (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e: any) => setTaxRate(e.target.value)}
                placeholder="19"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Análisis de márgenes y rentabilidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Costos Totales</div>
                <div className="text-2xl font-bold">${totalCost.toLocaleString('es-CL')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Margen Neto</div>
                <div
                  className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ${margin.toLocaleString('es-CL')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Margen Porcentaje</div>
                <div
                  className={`text-2xl font-bold ${marginPercent >= 5 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {marginPercent.toFixed(2)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Monto Impuestos</div>
                <div className="text-2xl font-bold">${taxAmount.toLocaleString('es-CL')}</div>
              </div>
            </div>

            <div className="pt-4">
              {meetsRequirement ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Margen cumple con el mínimo requerido (5%)
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    ❌ Margen insuficiente. Mínimo requerido: $
                    {minMarginRequired.toLocaleString('es-CL')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm font-semibold mb-2">Desglose:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Costo Producto:</span>
                  <span>${costPriceNum.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${shippingCostNum.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión:</span>
                  <span>${platformFeeNum.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos ({taxRateNum}%):</span>
                  <span>${taxAmount.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regla de Negocio #1 - Strict Margin Safeguards</CardTitle>
          <CardDescription>
            Ninguna orden puede finalizar si el margen neto es inferior al 5%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-sm font-semibold">Margen Bruto</div>
                <div className="text-lg font-bold text-blue-600">
                  ${salePriceNum > 0 ? (salePriceNum - costPriceNum).toLocaleString('es-CL') : '0'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
              <Percent className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-sm font-semibold">Margen Neto</div>
                <div
                  className={`text-lg font-bold ${marginPercent >= 5 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {marginPercent.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-sm font-semibold">Estado</div>
                <div
                  className={`text-lg font-bold ${meetsRequirement ? 'text-green-600' : 'text-red-600'}`}
                >
                  {meetsRequirement ? 'APROBADO' : 'RECHAZADO'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Implementación requerida:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Cálculo en el OrderService antes de la confirmación del pago</li>
              <li>Uso de costos actualizados en tiempo real desde proveedores</li>
              <li>Considerar tasas de envío dinámicas (Enviame/Starken/Shipit)</li>
              <li>Incluir tasas de cambio CLP/USD actualizadas</li>
              <li>Cola de anomalías para órdenes rechazadas por margen</li>
              <li>Alerta automática tras 3+ órdenes consecutivas fallidas</li>
              <li>Modo override manual requiere aprobación de dos personas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
