const months = Array(12).fill(null).map((item, index) => {
  return (index + 1) + '月'
})
Page({
  data: {
    bonusMonth: 0,
    months: months,
    detail: [],
    taxTotal: undefined,
    moneyGetTotal: undefined
  },
  bindBonusMonthChange: function (e) {
    this.setData({
      bonusMonth: Number(e.detail.value)
    })
  },
  quickFormSubmit: function (e) {
    const { salary, bonus, bonusMonth, specialDeduction, insuranceDeduction } = e.detail.value
    this.setData(calc({
      salary: Number(salary),
      bonus: Number(bonus),
      bonusMonth: Number(bonusMonth),
      specialDeduction: Number(specialDeduction),
      insuranceDeduction: Number(insuranceDeduction)
    }))
  },
  quickFormReset: function () {
    this.setData({
      detail: [],
      taxTotal: undefined,
      moneyGetTotal: undefined
    })
  }
})

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
    const moneyGet = item.salary + (item.bonus || 0) - insuranceDeduction - taxPaid
    item.moneyGet = moneyGet
    item.taxPaid = taxPaid
    item.taxRate = taxRate
    return item
  })
  console.log(detail)
  const taxTotal = detail.map(item => item.taxPaid).reduce((sum, item) => {
    return sum + item
  })
  console.log('全年税额：' + taxTotal)
  const moneyGetTotal = detail.map(item => item.moneyGet).reduce((sum, item) => {
    return sum + item
  })
  console.log('全年到手：' + moneyGetTotal)
  console.log('再算一遍:')
  const { tax, moneyGet } = calcTotal(salary, bonus, bonusMonth, specialDeduction, insuranceDeduction)
  console.log('全年税额：' + tax)
  console.log('全年到手：' + moneyGet)
  return {
    detail,
    taxTotal: tax,
    moneyGetTotal: moneyGet
  }
}

function calcTotal (salary, bonus, bonusMonth, specialDeduction, insuranceDeduction) {
  const totalSalary = salary * 12 + bonus
  const totalSpecialDeduction = specialDeduction * 12
  const totalInsuranceDeduction = insuranceDeduction * 12
  const totalDeduction = 5000 * 12
  const shouldTaxAmountTotal = totalSalary - totalDeduction - totalSpecialDeduction - totalInsuranceDeduction
  const { taxRate, quickDeduction } = getTaxRateAndQuickDeduction(shouldTaxAmountTotal)
  const tax = shouldTaxAmountTotal * taxRate / 100 - quickDeduction
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