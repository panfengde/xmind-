const secondFilterOptions = [{
        "id": "1bcddudhmh",
        "type": "0",
        "name": "车贷"
    },
    {
        "id": "hc5g66kviq",
        "type": "0",
        "name": "车辆保养"
    },
    {
        "id": "8s0p77c323",
        "type": "0",
        "name": "房贷"
    },
    {
        "id": "0fnhbcle6hg",
        "type": "0",
        "name": "房屋租赁"
    },
    {
        "id": "odrjk823mj8",
        "type": "0",
        "name": "家庭用品"
    },
    {
        "id": "bsn20th0k2o",
        "type": "0",
        "name": "交通"
    },
    {
        "id": "j1h1nohhmmo",
        "type": "0",
        "name": "旅游"
    },
    {
        "id": "3tqndrjqgrg",
        "type": "0",
        "name": "日常饮食"
    },
    {
        "id": "s73ijpispio",
        "type": "1",
        "name": "工资"
    },
    {
        "id": "1vjj47vpd28",
        "type": "1",
        "name": "股票投资"
    },
    {
        "id": "5il79e11628",
        "type": "1",
        "name": "基金投资"
    }
]

let secondfilterKeyValue = {}
secondFilterOptions.forEach((obj) => {
    secondfilterKeyValue[obj.id] = obj.name;
})



/**
 * 财务统计模块
 * @params inputFile_id, domIdOrClass
 * inputFile_id:录入文件的控件id
 * domIdOrClass:嵌入组件的组件id或class
 * 
 * 通过调研new AccountBook(inputFile_id, domIdOrClass) 可以将该DOM初始化为一个财务统计模块
 * 使得组件可以被复用和分享；
 * 
 */
class AccountBook {

    constructor(inputFile_id, domIdOrClass) {
        this.dataStore = []; //数据最终仓库
        this.firstFilterData = []; //一类筛选的结果数据
        this.secondFilterData = []; //二类筛选的结果数据
        this.month = 0; //筛选月份
        this.monthName = "全部月份";
        this.totalIncome = 0; //该月份下的收入
        this.totalPay = 0; //筛选月份
        this.type = 2; //默认展示全部类
        this.secondtypes = []; //二类要展示的小类
        this.inputFile_id = inputFile_id;
        this.initTemplate(domIdOrClass);
        this.main();
    }

    addData(data) {
        this.dataStore.push(data)
        this.showFirstData = this.firstFilter();
        this.showSecondData = this.secondFilter();
    }

    main() {
        this.getDataArrayFromCSV()
        this.selectByMonth()
        this.secondTypeflter()
        this.showSecondFilter()
    }

    set showFirstData(data) {
        this.firstFilterData = data;
        this.countPay();
        this.countIncome();
        this.drawTable(this.firstFilterData, ".firstSelectTable");
        this.showStatistics();
    }
    get showFirstData() {
        return this.firstFilterData;
    }

    set showSecondData(data) {
        this.secondFilterData = data;
        this.secondFilterCount();
        this.drawTable(this.secondFilterData, ".secondSelectTable");
    }

    get showSecondData() {
        return this.secondFilterData;
    }

    initTemplate(domIdOrClass) {
        let html = `<div class="contentBox">
        <div class="firstFilter">
            <div class="filterText">
                <h2>月份筛选:</h2>
                <div class="chooseCtr">
                    <label for="month">
                        <span class="title">选择统计月份：</span>
                        <select name="month " class="monthflag">
                        </select>
                    </label>
                </div>
                <div class="chooseCtr StatisticsResult"></div>
            </div>
            <table class="firstSelectTable">
            </table>
        </div>
        <div class="secondFilter">
            <div class="filterText">
                <h2>分类筛选：</h2>
                <div class="chooseCtr secondType">
                </div>
                <div class="chooseCtr secondFilterBox">
                </div>
                <div class="chooseCtr secondStatistics"></div>
                <div class="chooseCtr secondStatisticsCount"></div>
            </div>
            <table class="secondSelectTable">
            </table>
        </div>
    </div>`;
        document.querySelector(domIdOrClass).innerHTML += html;
    }

    firstFilter() {
        if (this.month == 0) {
            return this.dataStore
        } else {
            return this.dataStore.filter((obj) => {
                return (new Date(obj.time).getMonth() + 1 == this.month);
            });
        }
    }

    secondFilter() {
        const secondtypes_id = new Set(this.secondtypes.filter((obj) => obj.checked).map((obj) => obj.id));
        return this.showFirstData.filter((obj) => {
            return secondtypes_id.has(obj.category);
        });
    }


    getDataArrayFromCSV() {
        let _this = this
        document.getElementById(this.inputFile_id).addEventListener('change', function () {
            if (this.files.length === 0) {
                console.log('请选择文件');
                return;
            }
            const reader = new FileReader();
            reader.onload = function fileReadCompleted() {
                // 当读取完成时，内容只在`reader.result`中
                let result = csvToObject(reader.result);
                _this.dataStore = result;
                _this.showFirstData = result;
                _this.showSecondData = result;

            };
            reader.readAsText(this.files[0]);
        });

        function csvToObject(csvString) {
            //需要换行的兼容性处理
            var csvarry = csvString.split("\n");
            var datas = [];
            var headers = csvarry[0].split(",");
            for (var i = 1; i < csvarry.length; i++) {
                var data = {};
                var temp = csvarry[i].split(",");
                for (var j = 0; j < temp.length; j++) {
                    data[headers[j]] = temp[j];
                }
                data.time = _this.formatDate(Number(data.time))
                data.amount = Number(data.amount)
                datas.push(data);
            }
            datas.sort((obj1, obj2) => obj1.time - obj2.time)
            return datas;
        }
    }

    drawTable(data, ClassName) {
        //type,time,category,amount
        let table = document.querySelector(ClassName);
        table.innerHTML = "";
        let kyes = Object.keys(this.dataStore[0])
        table.innerHTML = `<tr><th>序号</th>${ kyes.map((keyName)=>`<th>${keyName}</th>`).join("")}</tr>`;
        if (data.length == 0) {
            table.innerHTML += `<tr><td colspan=${kyes.length}>${this.month}的数据为空<td><tr>`
        } else {
            let contentHtml = data.map((obj, i) => {
                return `<tr><td >${i+1}</td>${
                    kyes.map(key => {
                        if(key=="category"){
                            return "<td>"+secondfilterKeyValue[obj.category]+"</td>";
                        }else if(key=="type"){
                            let txt=obj[key]==1?"收入":"支出";
                            return "<td>"+txt+"</td>";
                        }
                        else{
                            return "<td>"+obj[key]+"</td>";
                        }
                    }).join("")
                }</tr>`
            }).join("")
            table.innerHTML += contentHtml
        }

    }

    formatDate(data) {
        if (!data) {
            return "";
        }
        data = Number(data)
        return new Date(data).toISOString();
    };

    selectByMonth() {
        let _this = this;
        let select_month = document.querySelector(".monthflag");

        select_month.innerHTML += `<option value=${0}>所有月份</option>`;
        Array.from({
            length: 12
        }).forEach((_, i) => {
            select_month.innerHTML += `<option value=${i+1}>${i+1}月份</option>`;
        });

        select_month.addEventListener('change', function (e) {
            let month = Number(e.target.value);
            _this.month = month;
            _this.monthName = this.options[this.selectedIndex].text;
            let firstFilterData = _this.firstFilter();
            _this.showFirstData = firstFilterData;
            _this.showSecondData = _this.secondFilter();
        });
    }

    countPay() {
        this.totalPay = this.showFirstData.filter((obj) => obj.type == 0).reduce(((total, obj) => total + obj.amount), 0);
    }

    countIncome() {
        this.totalIncome = this.showFirstData.filter((obj) => obj.type == 1).reduce(((total, obj) => total + obj.amount), 0);
    }

    showStatistics() {
        let Statistics = document.querySelector(".StatisticsResult");
        Statistics.innerHTML = `${this.monthName}的总支出为<span class="tag">${this.totalPay}</span>,总收入为<span class="tag">${this.totalIncome}</span>`
    }

    secondTypeflter() {
        const callback = (e) => {
            this.type = e.target.value;
            this.showSecondFilter();
            this.showSecondData = this.secondFilter();
        };
        this.radioObjs && this.radioObjs.forEach((radioObj) => {
            radioObj.removeEventListener("change", callback)
        });

        let secondType = document.querySelector(".secondType");

        secondType.innerHTML = `<span class="title">收支:</span>`;

        secondType.innerHTML += `<label><input class="secondTypeRadio" name="secondType" type="radio" value="2" checked />全部</label>
                                 <label><input class="secondTypeRadio" name="secondType" type="radio" value="1" />收入</label>
                                 <label><input class="secondTypeRadio" name="secondType" type="radio" value="0" />支出</label>`;

        this.radioObjs = document.querySelectorAll('.secondTypeRadio');

        this.radioObjs.forEach((radioObj) => {
            radioObj.addEventListener("change", callback)
        })
    }

    showSecondFilter() {
        const callback = (e) => {
            this.secondtypes.find((obj) => obj.id == e.target.value).checked = e.target.checked;
            this.showSecondData = this.secondFilter();
        };
        this.radioObjs && this.radioObjs.forEach((radioObj) => {
            radioObj.removeEventListener("change", callback)
        });


        let secondFilterBox = document.querySelector(".secondFilterBox");

        secondFilterBox.innerHTML = `<span class="title">费用类型：:</span>`;

        let gettedSecondFilterOptions = this.type == "2" ? secondFilterOptions : secondFilterOptions.filter((obj) => obj.type == this.type);

        gettedSecondFilterOptions.forEach((obj) => {
            obj.checked = true;
            secondFilterBox.innerHTML += `<label><input class="secondTypeCheck" name=${obj.name} type="checkbox" value=${obj.id} checked />${obj.name}</label>`;
        });
        this.secondtypes = gettedSecondFilterOptions;

        this.checkObjs = document.querySelectorAll('.secondTypeCheck');

        this.checkObjs.forEach((checkObj) => {
            checkObj.addEventListener("change", callback)
        });

    }

    secondFilterCount() {
        const secondtypes_id = new Set(this.secondtypes.filter((obj) => obj.checked).map((obj) => obj.id));
        let result = {};

        secondtypes_id.forEach((id) => {
            result[id] = 0;
        })

        this.secondFilterData.forEach((obj) => {
            result[obj.category] += obj.amount
        })

        let count = [];

        for (let key in result) {
            count.push({
                name: secondfilterKeyValue[key],
                amount: result[key]
            })
        }
        count.sort((obj1, obj2) => obj2.amount - obj1.amount)
        let secondStatisticsCount = document.querySelector(".secondStatisticsCount");
        secondStatisticsCount.innerHTML = this.monthName + "的分类统计清空如下：";
        count.forEach((obj) => {
            secondStatisticsCount.innerHTML += `${obj.name}:<span class="tag">${obj.amount}</ span>`;
        })
    }
}