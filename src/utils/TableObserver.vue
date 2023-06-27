<script>
import ResizeObserver from "resize-observer-polyfill";
export default {
  data() {
    return {
      throttleResize: null,
      table: null,
      mFlag: false,
    };
  },
  methods: {
    observeTableSize(flag = false) {
      const vm = this;
      this.mFlag = flag;
      const tableElementList = [].slice.call(
        document.querySelectorAll(".vxe-table--main-wrapper")
      );

      tableElementList.forEach(function (table) {
        vm.adjustTableSize(table, flag);
      });
    },
    adjustTableSize(tableElement, flag = false) {
      this.table = tableElement;
      const tableBodyElement = tableElement.querySelector(".vxe-table--body");
      const headerElement = tableElement.querySelector(".vxe-table--header");
      const vm = this;

      vm.throttleResize = vm.throttle(vm.doResize, 100);
      window.addEventListener("resize", vm.throttleResize);

      // 日出勤剛開始 load 頁面時也要把表格設為 wrapper 寬度
      setTimeout(() => {
        vm.alignWrapperAndTable(tableElement, flag, true);
        vm.alignHeaderBodyCols(headerElement, tableBodyElement);
      }, 500);
    },
    alignWrapperAndTable(table, flag, isFirstLoad = false) {
      const tableWrapperElement = table.querySelector(".vxe-table--body-wrapper");
      const tableBodyElement = table.querySelector(".vxe-table--body");
      const bodyColgroupElement = tableBodyElement.querySelector("colgroup");
      const headerElement = table.querySelector(".vxe-table--header");
      const headerRowElement = table.querySelector(".vxe-header--row");
      const headerWrapperElement = table.querySelector(".vxe-table--header-wrapper");
      const borderElement = table.querySelector(".vxe-table--header-border-line");
      const emptyBlockElement = table.querySelector(".vxe-table--empty-block");
      const scrollWidth = tableWrapperElement.scrollWidth;
      const clientWidth = tableWrapperElement.clientWidth;

      let tableWidth = tableWrapperElement.style.width;

      // 如果是建立群組的雙表格那頁，而且是第一次剛進入畫面時，
      // 就要用 clientWidth 的值
      if (flag && isFirstLoad) tableWidth = table.clientWidth + "px";

      // 把下列各元素的寬設為 vxe 表格的 wrapper 的寬
      tableBodyElement.style.width = tableWidth;
      bodyColgroupElement.style.width = tableWidth;
      headerElement.style.width = tableWidth;
      headerRowElement.style.width = tableWidth;
      headerWrapperElement.style.width = tableWidth;
      borderElement.style.width = tableWidth;
      emptyBlockElement.style.width = tableWidth;
      headerWrapperElement.classList.add("w-100");
    },
    alignHeaderBodyCols(headerElement, tableBodyElement) {
      // 把 header 各個欄寬設為 body 的各個欄寬
      const headerColGroup = headerElement.querySelector("colgroup");
      const headerCols = [].slice.call(headerColGroup.querySelectorAll("col"));
      const bodyColGroup = tableBodyElement.querySelector("colgroup");
      const bodyCols = [].slice.call(bodyColGroup.querySelectorAll("col"));
      if (bodyCols) {
        for (let i = 0; i < bodyCols.length; i++) {
          headerCols[i].style.width = bodyCols[i].clientWidth + "px";
        }
      }
    },
    doResize() {
      const vm = this;
      const tableBodyElement = vm.table.querySelector(".vxe-table--body");
      const headerElement = vm.table.querySelector(".vxe-table--header");

      vm.alignWrapperAndTable(vm.table, vm.mFlag, false);
      vm.alignHeaderBodyCols(headerElement, tableBodyElement);
    },
    resizeOneTable() {
      const table = document.querySelector(".vxe-table--main-wrapper");
      const vm = this;
      const tableBodyElement = table.querySelector(".vxe-table--body");
      const headerElement = table.querySelector(".vxe-table--header");

      setTimeout(() => {
        vm.alignWrapperAndTable(table, false, false);
        vm.alignHeaderBodyCols(headerElement, tableBodyElement);
      });
    },
    throttle(f, delay) {
      let timer = 0;
      return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          f.apply(this, args);
        }, delay);
      };
    },
  },
};
</script>
