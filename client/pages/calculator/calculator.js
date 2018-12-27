import QQMap from '../../lib/qqmap-wx-jssdk.min.js'
import cityData from './cityData'

let qqMap
const months = Array(12).fill(null).map((item, index) => {
  return (index + 1) + '月'
})
const qqMapKey = 'F66BZ-FPXKO-5Y7WN-SIZBY-APOP6-QKB6P'

Page({
  data: {
    cityData: null,
    cityName: '',
    salary: 0,
    sbBase: 0,
    gjjBase: 0,
    customBase: {
      sb: false,
      gjj: false
    },
    bonusMonth: 0,
    months: months,
    detail: [],
    taxTotal: 0,
    moneyGetTotal: 0
  },
  onLoad: function () {
    qqMap = new QQMap({
      key: qqMapKey
    })
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.getCityAndInitData()
            }
          })
        }
      }
    })
    this.getCityAndInitData()
  },
  getCityAndInitData: function () {
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        const latitude = res.latitude
        const longitude = res.longitude
        qqMap.reverseGeocoder({
          location: {latitude, longitude},
          success: res => {
            console.log(res);
            const cityChinese = res.result.ad_info.city
            const cityItem = cityData.find(item => item.chinese === cityChinese) || cityData[0]
            const { sbBase, gjjBase } = getBase(0, cityItem.data.base)
            this.setData({
              cityData: cityItem,
              sbBase: sbBase,
              gjjBase: gjjBase
            })
          },
          fail: res => {
            console.log(res);
          },
          complete: res => {
            // console.log(res);
          }
      })
      }
    })
  },
  onQuickSalaryInput: function (e) {
    const salary = Number(e.detail.value)
    let updates = {
      salary: salary
    }
    const { customBase, cityData } = this.data
    const { gjjBase, sbBase } = getBase(salary, cityData.data.base)
    if (!customBase.gjj) {
      updates.gjjBase = gjjBase
    }
    if (!customBase.sb) {
      updates.sbBase = sbBase
    }
    this.setData(updates)
  },
  onCustomBaseChange: function (e) {
    const type = e.currentTarget.dataset.type
    const flag = e.detail.value.length === 1
    let updates = {
      customBase: {
        ...this.data.customBase,
        [type]: flag
      }
    }
    if (!flag) {
      const { salary, cityData } = this.data
      const base = getBase(salary, cityData.data.base)
      const baseKey = `${type}Base`
      updates[baseKey] = base[baseKey]
    }
    this.setData(updates)
  },
  onBonusMonthChange: function (e) {
    this.setData({
      bonusMonth: Number(e.detail.value)
    })
  },
  quickFormSubmit: function (e) {
    const { salary, bonus, bonusMonth, specialDeduction, sbBase, gjjBase } = e.detail.value
    const insuranceDeduction = getInsuranceDeduction({
      gjjBase: Number(gjjBase),
      sbBase: Number(sbBase),
      data: this.data.cityData.data
    })
    this.setData(calc({
      salary: Number(salary),
      bonus: Number(bonus),
      bonusMonth: Number(bonusMonth),
      specialDeduction: Number(specialDeduction),
      insuranceDeduction: Number(insuranceDeduction)
    }))
  },
  quickFormReset: function () {
    console.log(this.data)
    this.setData({
      detail: [],
      taxTotal: 0,
      moneyGetTotal: 0
    })
  }
})

function getBase(salary, base) {
  return {
    gjjBase: salary < base.gjjBaseMin ? base.gjjBaseMin : salary > base.gjjBaseMax ? base.gjjBaseMax : salary,
    sbBase: salary < base.sbBaseMin ? base.sbBaseMin : salary > base.sbBaseMax ? base.sbBaseMax : salary
  }
}
function getInsuranceDeduction ({gjjBase, sbBase, data, extraGjj = 0}) {
  const sbRate = Object.values(data.person.sb).reduce((sum, item) => sum + item) / 100
  const gjjRate = (data.person.gjj + extraGjj) / 100
  return gjjBase * gjjRate + sbBase * sbRate
}

function calc({salary, bonus, bonusMonth, specialDeduction, insuranceDeduction}) {
  const regular = { salary, specialDeduction, insuranceDeduction }
  let totalSalary = 0
  let totalSpecialDeduction = 0
  let totalInsuranceDeduction = 0
  let totalTaxPaid = 0
  let detail = Array(12).fill(null).map((temp, index) => {
    let item = {...regular, index: index}
    if (index === bonusMonth) {
      item.bonus = Number(bonus)
    }
    totalSalary += item.salary + (item.bonus || 0)
    const totalDeduction = 5000 * (index + 1)
    totalSpecialDeduction += item.specialDeduction
    totalInsuranceDeduction += item.insuranceDeduction
    const shouldTaxAmount = totalSalary - totalDeduction - totalSpecialDeduction - totalInsuranceDeduction
    const { taxRate, quickDeduction } = getTaxRateAndQuickDeduction(shouldTaxAmount)
    const taxPaid = shouldTaxAmount > 0 ? +(shouldTaxAmount * taxRate / 100 - quickDeduction - totalTaxPaid).toFixed(2) : 0
    totalTaxPaid += taxPaid
    const moneyGet = +(item.salary + (item.bonus || 0) - insuranceDeduction - taxPaid).toFixed(2)
    item.moneyGet = moneyGet
    item.taxPaid = taxPaid
    item.taxRate = taxRate
    return item
  })
  console.log(detail)
  // const taxTotal = detail.map(item => item.taxPaid).reduce((sum, item) => {
  //   return sum + item
  // })
  // const moneyGetTotal = detail.map(item => item.moneyGet).reduce((sum, item) => {
  //   return sum + item
  // })
  const { tax, moneyGet } = calcTotal({salary, bonus, specialDeduction, insuranceDeduction})
  return {
    detail,
    taxTotal: tax,
    moneyGetTotal: moneyGet
  }
}

function calcTotal ({salary, bonus, specialDeduction, insuranceDeduction}) {
  const totalSalary = salary * 12 + bonus
  const totalSpecialDeduction = specialDeduction * 12
  const totalInsuranceDeduction = insuranceDeduction * 12
  const totalDeduction = 5000 * 12
  const shouldTaxAmountTotal = totalSalary - totalDeduction - totalSpecialDeduction - totalInsuranceDeduction
  const { taxRate, quickDeduction } = getTaxRateAndQuickDeduction(shouldTaxAmountTotal)
  const tax = +(shouldTaxAmountTotal * taxRate / 100 - quickDeduction).toFixed(2)
  const moneyGet = totalSalary - totalInsuranceDeduction - tax
  return {tax, moneyGet}
}

function getTaxRateAndQuickDeduction (amount) {
  let taxRate = 0
  let quickDeduction = 0
  if (amount <= 0) {
    taxRate = 0
  } else if (amount <= 36000) {
    taxRate = 3
  } else if (amount <= 144000) {
    taxRate = 10
    quickDeduction = 2520
  } else if (amount <= 300000) {
    taxRate = 20
    quickDeduction = 16920
  } else if (amount <= 420000) {
    taxRate = 25
    quickDeduction = 31920
  } else if (amount <= 660000) {
    taxRate = 30
    quickDeduction = 52920
  } else if (amount <= 960000) {
    taxRate = 35
    quickDeduction = 85920
  } else {
    taxRate = 45
    quickDeduction = 181920
  }
  return {taxRate, quickDeduction}
}