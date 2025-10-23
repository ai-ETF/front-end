<script setup lang="ts">
import { ref } from 'vue'
import { Layout} from 'ant-design-vue'
import { UploadOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import sider_collapsed from '@/assets/svg/sidebar-collapse.svg'
import sider_expand from '@/assets/svg/sidebar-expand.svg'

/* -----------------------
   小知识：Layout 组件的解构
   Ant Design Vue 的 Layout 导出多个子组件（Header, Sider, Content），
   这里解构是为了模板中方便直接使用 <Header> 等标签。
   ----------------------- */
const { Header, Sider, Content } = Layout

/* -----------------------
   响应式状态（reactive state）
   - collapsed: 控制侧栏折叠/展开（布尔）
   - selectedKeys: 当前菜单的选中项（Menu 需要一个数组的 key）
   知识点：ref() 用于基础类型的响应式，模板中可以直接访问（自动解包）。
   ----------------------- */
const collapsed = ref<boolean>(false)
const selectedKeys = ref<string[]>(['1'])

/* -----------------------
   路由（router）
   useRouter 返回一个 router 实例，用于编程式导航（router.push）
   知识点：router.push('/path') 会向路由栈加入一个新记录（与 <router-link> 行为一致）。
   ----------------------- */
const router = useRouter()

/* -----------------------
   菜单项的数据结构（用于 Menu 的 items）
   - icon 使用一个函数返回 VNode（h(iconComponent)），符合 Ant Design Menu 的 items 规范
   知识点：Ant Design 的 Menu 支持 items 配置形式，便于程序化生成菜单。
   ----------------------- */
type MenuItem = {
  key: string
  icon?: () => any
  label: string
  path?: string
}

const menuItems: MenuItem[] = [
  {
    key: '1',
    icon: UserOutlined,
    label: 'AI对话',
    path: '/chat'
  },
  {
    key: '2',
    icon: UploadOutlined,
    label: '文档库',
    path: '/files'
  }
]

const handleMenuClick = (item: MenuItem) => {
  selectedKeys.value = [item.key]
  if (item.path) router.push(item.path)
}

</script>

<template>
  <Layout has-sider class="layout-container">
    <Sider
      class="sider-style"
      :width="260"
      :collapsed-width="52"
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
    >
      <div class="logo">
        <div v-if="!collapsed" class="logo-expanded">
          <div class="logo-left">
        <span class="logo-emoji">🐽</span>
        <span class="logo-text"></span>
          </div>
          <div class="logo-right">
        <img
          :src="sider_collapsed"
          alt="Navigation"
          class="collapse-icon"
          @click="() => (collapsed = !collapsed)"
        />
          </div>
        </div>


        <div
          v-else
          class="logo-collapsed"
          @mouseenter="(e) => {
        const pig = (e.currentTarget as HTMLElement).querySelector('.logo-emoji');
        const img = (e.currentTarget as HTMLElement).querySelector('.expand-img');
        if (pig) (pig as HTMLElement).style.display = 'none';
        if (img) (img as HTMLElement).style.display = 'block';
          }"
          @mouseleave="(e) => {
        const pig = (e.currentTarget as HTMLElement).querySelector('.logo-emoji');
        const img = (e.currentTarget as HTMLElement).querySelector('.expand-img');
        if (pig) (pig as HTMLElement).style.display = 'flex';
        if (img) (img as HTMLElement).style.display = 'none';
          }"
        >
          <!-- 折叠时默认显示猪鼻子 -->
          <span class="logo-emoji" style="display:flex" @click="() => (collapsed = !collapsed)">🐽</span>

          <!-- 鼠标悬停时显示的展开图标（默认隐藏） -->
          <img
        :src="sider_expand"
        alt="Expand"
        class="collapse-icon expand-img"
        style="display:none"
        @click="() => (collapsed = !collapsed)"
          />
        </div>
      </div>

      <div class="custom-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: selectedKeys.includes(item.key), collapsed: collapsed }"
          @click="() => handleMenuClick(item)"
        >
          <!-- 图标 -->
          <div class="menu-icon">
            <component :is="item.icon" />
          </div>

          <!-- 文本（折叠时淡出） -->
          <transition name="fade">
            <div v-if="!collapsed" class="menu-label">
              {{ item.label }}
            </div>
          </transition>
        </div>
      </div>
    </Sider>

    <Layout class="layout-main">
      <Header class="site-layout-header">
        <span class="header-title">小E你的ETF智能助手</span>
      </Header>
      <Content class="site-layout-content">
        <router-view />
      </Content>
    </Layout>
  </Layout>
</template>

<style scoped> 
/* DefaultLayout.vue 的样式（已整理并添加详细注释）
  说明：
  - 这个文件只包含 CSS 部分（scoped 仍然会在组件中使用）。
  - 注释使用中文，面向完全没有 CSS 经验的初学者。
  - 每个规则前会说明它控制的界面区域和关键属性的作用。
*/

/* ======================================================
  全局盒模型设置
  目的：确保所有元素在计算宽高时包括内边距和边框（推荐做法）
  box-sizing: border-box：
    - width/height 包括 padding 和 border（更容易布局）
  ====================================================== */
* {
  box-sizing: border-box; /* 推荐：统一盒模型，避免计算混乱 */
}

/* ======================================================
  侧边栏（Sider）整体样式
  控制：侧边栏尺寸、背景、过渡动画（折叠时会用到）
  ====================================================== */
.sider-style {
  height: 100vh;            /* 占据整个视口高度 */
  width: 260px;             /* 默认宽度（折叠前） */
  background: #f9f9f9;      /* 浅灰背景 */
  transition: all 0.3s ease; /* 平滑变化（宽度、padding 等变化时） */
  min-width: 260px;         /* 最小宽度，防止被压瘪 */
  box-sizing: border-box;
  border-right: 1px solid #e8e8e8; /* 添加浅灰色右边框，符合 Ant Design 设计规范 */
}

/* ======================================================
  布局容器
  控制：外部主容器和内部主布局的背景与尺寸
  ====================================================== */
.layout-container {
  height: 100vh;
  width: 100vw;
  background: #fff;
}

.layout-main {
  height: 100vh;
  width: 100vw;
  background: #fff;
}

/* ======================================================
  头部 Header 样式
  控制：高度、对齐、阴影、内边距
  说明：box-shadow 用于产生细微分层感
  ====================================================== */
.site-layout-header {
  background: #fff;
  padding: 0 16px; /* 左右内边距 */
  display: flex;
  align-items: center;     /* 垂直居中内容 */
  box-shadow: 0 1px 4px rgba(160, 233, 211, 0.08); /* 轻微阴影 */
  height: 64px;            /* 固定头部高度 */
  box-sizing: border-box;
}

/* Header 内标题样式（字体颜色/大小/粗细） */
.header-title {
  color: #333;
  font-size: 18px;
  font-weight: bold;
  box-sizing: border-box;
}

/* ======================================================
  内容区 Content 样式
  控制：外边距、内边距、滚动、可视高度
  说明：height 计算用到了头部和外层 margin（减去这些值）
  ====================================================== */
.site-layout-content {
  background: #fff;
  overflow: auto;    /* 内容过多时出现滚动条 */
  height: calc(100vh - 64px); /* 计算剩余高度（头部 64 + margin top+bottom 48） */
  box-sizing: border-box;
}

/* ======================================================
  LOGO 区域（侧边栏顶部）
  - 非折叠状态（宽 260）
  - 折叠状态（宽 80）
  这个区域包含 .logo-expanded 和 .logo-collapsed 两种子状态
  ====================================================== */

/* 外层容器：固定高度，左右内边距，水平两端对齐 */
.logo {
  width: 260px;               /* 与侧栏宽度一致（非折叠） */
  height: 52px;               /* 固定高度 */
  display: flex;
  align-items: center;        /* 垂直居中 logo 内容 */
  padding: 0 16px;
  transition: all 0.3s ease;  /* 折叠时平滑过渡 */
  box-sizing: border-box;
  justify-content: space-between; /* 左右两端对齐：左边 logo，右边折叠图标 */
}

/* 非折叠时的内部布局：左右两部分 */
.logo-expanded {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
}

/* 折叠时的布局：内容居中 */
.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  height: 52px;
}

/* logo 小图标（用于图片或 emoji） */
.logo-image {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
}

/* logo 左侧容器（放 emoji 或图片） */

.logo-left {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  width: 36px;
  box-sizing: border-box;
}


.logo-right {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  width: 36px;
  box-sizing: border-box;
}

/* 折叠/展开图标样式（图片或 SVG） */
.collapse-icon {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  cursor: pointer;         /* 鼠标悬停显示手型，表示可点击 */
  transition: all 0.3s;    /* 平滑动画（hover 放大、背景变化） */
  border-radius: 4px;      /* 轻微圆角 */
}

/* hover 时的视觉反馈（背景 + 放大） */
.collapse-icon:hover {
  background-color: #e6f7ff; /* 浅蓝背景提示可操作 */
  transform: scale(1.2);     /* 放大一点点 */
}

/* logo 文字（侧栏展开时显示的应用名称） */
.logo-text {
  color: #1890ff;           /* Ant Design 蓝 */
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;      /* 不换行 */
  overflow: hidden;         /* 超出隐藏 */
  text-overflow: ellipsis;  /* 超出显示省略号 */
  box-sizing: border-box;
}

/* ======================================================
  小猪表情（emoji）样式与动画（关键部分）
  - 这个是你关注动画效果的主要目标：.logo-emoji
  - 包括鼠标 hover、active、以及入场动画
  ====================================================== */

/* 1) 定义入场动画 keyframes：piggy-pop
  动画解释（百分比）：
  - 0%：开始时缩小并带一点旋转，几乎透明
  - 60%：过冲（稍微放大并有小角度旋转），变为不透明
  - 100%：回到正常大小和角度
  这会产生一种“弹出”的动态效果，常用来提高视觉活力。
*/
@keyframes piggy-pop {
  0% {
   transform: scale(0.8) rotate(-10deg);
   opacity: 0; /* 从透明开始出现 */
  }
  60% {
   transform: scale(1.08) rotate(5deg); /* 过冲效果（稍微放大） */
   opacity: 1;
  }
  100% {
   transform: scale(1) rotate(0deg); /* 最终恢复正常大小与角度 */
   opacity: 1;
  }
}

/* 2) .logo-emoji 的样式与交互（关键规则）
  解释每一项属性的作用，便于初学者理解：
  - font-size：决定 emoji 的视觉大小
  - display / align-items / justify-content：使其成为一个圆形容器并居中内容
  - width / height：定义圆盘尺寸
  - background：径向渐变，制造漂亮的高光色彩
  - border-radius:50%：变为圆形
  - box-shadow：内外阴影让图标更“立体”
  - transition：鼠标 hover 时平滑过渡
  - cursor / user-select：提示可交互并禁止选择（避免拖选 emoji）
  - animation：入场播放我们上面定义的 keyframes（0.6s）
*/
.logo-emoji {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  /* 渐变背景（从浅到深），看起来像高光 */
  background: radial-gradient(circle at 30% 30%, #ffe8ec, #ffc2cc);

  border-radius: 50%; /* 圆形 */
  /* 阴影：inset 是内阴影，后面是外阴影（更有层次） */
  box-shadow:
   inset 0 1px 2px rgba(255, 255, 255, 0.8),
   0 2px 4px rgba(0, 0, 0, 0.1),
   0 0 6px rgba(255, 182, 193, 0.4);

  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); /* 过渡曲线，常见的缓动函数 */
  cursor: pointer;     /* 提示可点 */
  user-select: none;   /* 禁止选中文本，防止拖选动画乱动 */

  animation: piggy-pop 0.6s ease-out; /* 入口动画，播放一次 */
}

/* Hover（鼠标悬停）时的效果：
  - 轻微旋转和放大（更活泼）
  - 更强的投影和更暖的背景
*/
.logo-emoji:hover {
  transform: rotate(8deg) scale(1.08);
  box-shadow:
   inset 0 1px 2px rgba(255, 255, 255, 0.9),
   0 3px 6px rgba(255, 182, 193, 0.6),
   0 0 8px rgba(255, 182, 193, 0.6);
  background: radial-gradient(circle at 25% 25%, #ffdbe2, #ffa9b8);
}

/* Active（按下 / 点击）时的效果：
  - 稍微缩小，制造按压感
  - 更深的内阴影（像被按下去了）
*/
.logo-emoji:active {
  transform: rotate(0deg) scale(0.96);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}


/* ======================================================
  折叠状态下的特殊调整（侧栏宽变为 52px）
  这些规则通过 .ant-layout-sider-collapsed class 生效（由 ant-layout 添加）
  ====================================================== */

/* ❗折叠后侧栏整体宽度调整（穿透 ant-design 样式） */
:deep(.sider-style.ant-layout-sider-collapsed) {
  width: 52px !important;
  min-width: 52px !important;
}


/* 折叠后 logo 容器宽度、padding 与对齐方式调整（居中显示） */
.sider-style.ant-layout-sider-collapsed .logo {
  width: 52px;
  padding: 0;
  justify-content: center;
}

/* 隐藏 logo 文本（只留图标） */
.sider-style.ant-layout-sider-collapsed .logo-text {
  display: none;
}

/* ====================== 自定义菜单区域 ====================== */
.custom-menu {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  transition: all 0.3s ease;
}

/* 单个菜单项样式 */
.menu-item {
  display: flex;
  align-items: center;
  /* position: absolute; */
  height: 36px;
  margin: 0px 6px;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  font-weight: 500;
  overflow: hidden;
}

/* hover 效果 */
.menu-item:hover {
  background-color: #f2f2f2;
  color: #1890ff;
  transform: translateX(2px);
}

/* 选中状态 */
.menu-item.active {
  background-color: #efefef;
  color: #1890ff;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #1890ff;
  transform: translateX(2px);
}

/* 图标部分（左侧固定） */
.menu-icon {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

/* 标签文字部分 */
.menu-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 折叠状态下的样式 */
.sider-style.ant-layout-sider-collapsed .custom-menu {
  align-items: center;
}

.sider-style.ant-layout-sider-collapsed .menu-item {
  justify-content: center;
  width: 100%;
  /* width: 52px; */
  padding: 0;
}

/* 过渡动画名称 fade（用于文字显示淡入淡出） */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


</style>