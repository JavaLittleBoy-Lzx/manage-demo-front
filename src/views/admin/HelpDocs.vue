<template>
  <div class="help-docs">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <div class="title-icon">
            <el-icon class="header-icon">
              <QuestionFilled />
            </el-icon>
          </div>
          <div class="title-text">
            <h1>帮助文档</h1>
            <p class="title-desc">
              系统使用指南和常见问题解答
              <el-tag v-if="userRoleName" size="small" class="role-tag">
                {{ userRoleName }}
              </el-tag>
            </p>
          </div>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帮助内容..."
            :prefix-icon="Search"
            class="search-input"
            @input="handleSearch"
            clearable
          />
        </div>
      </div>
    </div>

    <div class="container">
      <el-row :gutter="24">
        <!-- 左侧：文档目录 -->
        <el-col :span="6">
          <el-card class="docs-nav-card" shadow="hover">
            <div class="docs-nav">
              <div class="nav-section">
                <h4 class="section-title">快速开始</h4>
                <div class="nav-items">
                  <div 
                    v-for="item in quickStartItems" 
                    :key="item.key"
                    :class="['nav-item', { active: activeDoc === item.key }]"
                    @click="activeDoc = item.key"
                  >
                    <el-icon class="nav-icon">
                      <component :is="item.icon" />
                    </el-icon>
                    <span class="nav-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>

              <div class="nav-section">
                <h4 class="section-title">功能指南</h4>
                <div class="nav-items">
                  <div 
                    v-for="item in featureItems" 
                    :key="item.key"
                    :class="['nav-item', { active: activeDoc === item.key }]"
                    @click="activeDoc = item.key"
                  >
                    <el-icon class="nav-icon">
                      <component :is="item.icon" />
                    </el-icon>
                    <span class="nav-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>

              <div class="nav-section">
                <h4 class="section-title">常见问题</h4>
                <div class="nav-items">
                  <div 
                    v-for="item in faqItems" 
                    :key="item.key"
                    :class="['nav-item', { active: activeDoc === item.key }]"
                    @click="activeDoc = item.key"
                  >
                    <el-icon class="nav-icon">
                      <component :is="item.icon" />
                    </el-icon>
                    <span class="nav-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：文档内容 -->
        <el-col :span="18">
          <el-card class="docs-content-card" shadow="hover">
            <!-- 系统介绍 -->
            <div v-show="activeDoc === 'introduction'" class="doc-content">
              <h2>系统介绍</h2>
              <div class="content-section">
                <h3>系统概述</h3>
                <p>雪人停车管理系统是一个现代化的智慧停车管理平台，集成了车辆管理、违规处理、数据分析、用户管理等功能模块，为停车场运营提供全方位的数字化解决方案。</p>
                
                <h3>主要功能</h3>
                <ul>
                  <li><strong>车辆管理</strong>：支持车辆信息录入、查询、修改等操作</li>
                  <li><strong>违规处理</strong>：自动检测违规行为，支持手动和自动处理</li>
                  <li><strong>数据分析</strong>：提供丰富的统计报表和数据分析功能</li>
                  <li><strong>用户管理</strong>：支持多角色用户管理和权限控制</li>
                  <li><strong>系统设置</strong>：灵活的系统参数配置和个性化设置</li>
                </ul>

                <h3>技术特点</h3>
                <ul>
                  <li>采用现代化的前端技术栈，界面美观易用</li>
                  <li>响应式设计，支持多设备访问</li>
                  <li>模块化架构，易于扩展和维护</li>
                  <li>完善的权限管理和安全机制</li>
                </ul>
              </div>
            </div>

            <!-- 快速入门 -->
            <div v-show="activeDoc === 'quickstart'" class="doc-content">
              <h2>快速入门</h2>
              <div class="content-section">
                <h3>登录系统</h3>
                <ol>
                  <li>打开浏览器，访问系统地址</li>
                  <li>输入用户名和密码</li>
                  <li>点击"登录"按钮进入系统</li>
                </ol>

                <h3>界面导航</h3>
                <p>系统采用左侧导航栏 + 顶部工具栏的布局方式：</p>
                <ul>
                  <li><strong>左侧导航栏</strong>：包含所有功能模块的入口</li>
                  <li><strong>顶部工具栏</strong>：包含搜索、通知、用户信息等功能</li>
                  <li><strong>主内容区</strong>：显示当前功能模块的详细内容</li>
                </ul>

                <h3>基本操作</h3>
                <div class="operation-steps">
                  <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>查看数据</h4>
                      <p>在列表页面可以查看、搜索、筛选数据</p>
                    </div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>添加数据</h4>
                      <p>点击"新增"按钮，填写表单信息并保存</p>
                    </div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>编辑数据</h4>
                      <p>点击表格中的"编辑"按钮，修改信息并保存</p>
                    </div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-content">
                      <h4>删除数据</h4>
                      <p>选择要删除的记录，点击"删除"按钮确认</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户管理 -->
            <div v-show="activeDoc === 'user-management'" class="doc-content">
              <h2>用户管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>用户管理模块用于管理系统中的所有用户账户，包括账户创建、权限分配、状态管理等功能。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>新增用户</h4>
                    <p>点击"新增用户"按钮，填写用户基本信息、分配角色和部门，设置初始密码后保存。</p>
                  </div>
                  <div class="feature-item">
                    <h4>编辑用户</h4>
                    <p>可以修改用户的基本信息、角色权限、部门归属等。</p>
                  </div>
                  <div class="feature-item">
                    <h4>启用/禁用</h4>
                    <p>快速切换用户账户的启用状态，禁用后用户将无法登录系统。</p>
                  </div>
                  <div class="feature-item">
                    <h4>重置密码</h4>
                    <p>管理员可以为用户重置登录密码。</p>
                  </div>
                </div>

                <h3>注意事项</h3>
                <div class="warning-box">
                  <el-icon class="warning-icon"><Warning /></el-icon>
                  <div class="warning-content">
                    <p>删除用户前，请确保该用户没有关联的重要数据记录。建议使用"禁用"功能代替删除。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 角色管理 -->
            <div v-show="activeDoc === 'role-management'" class="doc-content">
              <h2>角色管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>角色管理模块用于定义不同的用户角色，并为每个角色分配相应的权限，实现基于角色的访问控制（RBAC）。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>创建角色</h4>
                    <p>新建角色，设置角色名称和描述信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>分配权限</h4>
                    <p>为角色勾选可访问的菜单和功能权限。</p>
                  </div>
                  <div class="feature-item">
                    <h4>编辑角色</h4>
                    <p>修改角色的名称、描述和权限配置。</p>
                  </div>
                  <div class="feature-item">
                    <h4>删除角色</h4>
                    <p>删除不再使用的角色，已关联用户的角色无法删除。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 权限管理 -->
            <div v-show="activeDoc === 'permission-management'" class="doc-content">
              <h2>权限管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>权限管理模块用于定义系统中的所有功能权限点，包括菜单访问权限和操作权限。</p>

                <h3>权限类型</h3>
                <div class="violation-types">
                  <el-tag type="primary">菜单权限</el-tag>
                  <el-tag type="success">查询权限</el-tag>
                  <el-tag type="warning">编辑权限</el-tag>
                  <el-tag type="danger">删除权限</el-tag>
                </div>

                <h3>主要操作</h3>
                <p>配置权限树结构，定义父级权限和子级权限的关系，实现细粒度的权限控制。</p>
              </div>
            </div>

            <!-- 巡检人员管理 -->
            <div v-show="activeDoc === 'staff-management'" class="doc-content">
              <h2>巡检人员管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>巡检人员管理模块用于管理车场巡检工作人员的信息，包括人员档案、所属车场、职位等信息。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>新增巡检人员</h4>
                    <p>录入巡检人员的基本信息、联系方式、所属车场和职位信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>分配车场</h4>
                    <p>为巡检人员指定负责的车场区域。</p>
                  </div>
                  <div class="feature-item">
                    <h4>状态管理</h4>
                    <p>设置巡检人员的在职状态，离职人员可设置为禁用状态。</p>
                  </div>
                  <div class="feature-item">
                    <h4>导出数据</h4>
                    <p>支持将巡检人员信息导出为Excel表格。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 小区管理 -->
            <div v-show="activeDoc === 'community-management'" class="doc-content">
              <h2>小区管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>小区管理模块用于管理停车系统所服务的小区信息，包括小区基本信息、地址、车位数量等。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加小区</h4>
                    <p>录入小区名称、地址、车位总数、已使用车位数等信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>小区配置</h4>
                    <p>配置小区的停车规则、收费标准等参数。</p>
                  </div>
                  <div class="feature-item">
                    <h4>车位统计</h4>
                    <p>查看小区车位的使用情况和空闲车位数量。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 业主管理 -->
            <div v-show="activeDoc === 'owner-management'" class="doc-content">
              <h2>业主管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>业主管理模块用于管理停车场内的业主信息，包括业主基本信息、车辆信息、联系方式等。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加业主</h4>
                    <p>点击"新增业主"按钮，填写业主基本信息、车辆信息等，保存后即可完成添加。</p>
                  </div>
                  <div class="feature-item">
                    <h4>查询业主</h4>
                    <p>支持按姓名、车牌号、电话等多种方式查询业主信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>编辑业主</h4>
                    <p>在业主列表中点击"编辑"按钮，可以修改业主的各项信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>删除业主</h4>
                    <p>选择要删除的业主记录，点击"删除"按钮，确认后即可删除。</p>
                  </div>
                </div>

                <h3>注意事项</h3>
                <div class="warning-box">
                  <el-icon class="warning-icon"><Warning /></el-icon>
                  <div class="warning-content">
                    <p>删除业主信息前，请确保该业主没有相关的违规记录或预约记录，否则可能影响数据完整性。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 出入口系统 -->
            <div v-show="activeDoc === 'gate-management'" class="doc-content">
              <h2>出入口系统绑定</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>出入口系统绑定模块用于配置和管理停车场的出入口设备，包括道闸、摄像头等设备的绑定和状态监控。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加出入口</h4>
                    <p>配置新的出入口设备，包括设备编号、位置、类型等信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>设备绑定</h4>
                    <p>将物理设备与系统进行绑定，实现设备联动控制。</p>
                  </div>
                  <div class="feature-item">
                    <h4>状态监控</h4>
                    <p>实时查看各出入口设备的在线状态和运行情况。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 车场信息管理 -->
            <div v-show="activeDoc === 'yard-management'" class="doc-content">
              <h2>车场信息管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>车场信息管理模块用于管理停车场的基本信息、车位配置、收费标准等核心数据。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>车场信息</h4>
                    <p>配置车场名称、地址、联系方式、营业时间等基本信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>车位配置</h4>
                    <p>设置车场的总车位数、车位类型（临时/固定）、车位编号等。</p>
                  </div>
                  <div class="feature-item">
                    <h4>收费标准</h4>
                    <p>配置不同类型车辆的收费标准和计费规则。</p>
                  </div>
                  <div class="feature-item">
                    <h4>车位监控</h4>
                    <p>实时查看车位使用情况和空闲车位分布。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 外来车辆预约 -->
            <div v-show="activeDoc === 'vehicle-reservation'" class="doc-content">
              <h2>外来车辆预约</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>外来车辆预约模块用于管理访客车辆的预约停车申请，提高车位使用效率和访客体验。</p>

                <h3>预约流程</h3>
                <div class="process-flow">
                  <div class="flow-step">
                    <div class="flow-icon">1</div>
                    <div class="flow-content">
                      <h4>提交预约</h4>
                      <p>访客填写车牌号、预约时间等信息</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">2</div>
                    <div class="flow-content">
                      <h4>审核预约</h4>
                      <p>管理员审核预约信息</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">3</div>
                    <div class="flow-content">
                      <h4>生成凭证</h4>
                      <p>审核通过后生成电子凭证</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">4</div>
                    <div class="flow-content">
                      <h4>入场放行</h4>
                      <p>凭证核验后自动放行</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 月票管理 -->
            <div v-show="activeDoc === 'month-ticket'" class="doc-content">
              <h2>月票管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>月票管理模块用于管理固定车位业主的月度停车票据，包括月票办理、续费、退费等功能。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>办理月票</h4>
                    <p>为业主办理月票，绑定车牌号、车位号、有效期等信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>月票续费</h4>
                    <p>月票到期前可以进行续费操作，延长有效期。</p>
                  </div>
                  <div class="feature-item">
                    <h4>月票退费</h4>
                    <p>业主不再需要时可以申请退费，系统自动计算退款金额。</p>
                  </div>
                  <div class="feature-item">
                    <h4>到期提醒</h4>
                    <p>系统自动提醒即将到期的月票，避免影响正常使用。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 黑名单管理 -->
            <div v-show="activeDoc === 'blacklist-management'" class="doc-content">
              <h2>黑名单管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>黑名单管理模块用于管理被限制进入车场的车辆，包括黑名单添加、移除、自动拉黑规则配置等。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加黑名单</h4>
                    <p>手动将违规车辆添加到黑名单，填写拉黑原因和备注。</p>
                  </div>
                  <div class="feature-item">
                    <h4>自动拉黑</h4>
                    <p>系统根据违规次数自动将车辆加入黑名单。</p>
                  </div>
                  <div class="feature-item">
                    <h4>移出黑名单</h4>
                    <p>问题解决后可以将车辆从黑名单中移除。</p>
                  </div>
                  <div class="feature-item">
                    <h4>黑名单查询</h4>
                    <p>查看黑名单车辆的详细信息和拉黑原因。</p>
                  </div>
                </div>

                <h3>拉黑规则</h3>
                <p>可以配置自动拉黑的规则，例如：</p>
                <ul>
                  <li>违规停车累计达到N次</li>
                  <li>长期欠费未缴纳</li>
                  <li>恶意损坏车场设施</li>
                </ul>
              </div>
            </div>

            <!-- 白名单管理 -->
            <div v-show="activeDoc === 'whitelist-management'" class="doc-content">
              <h2>白名单管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>白名单管理模块用于管理拥有特殊通行权限的车辆，白名单车辆可以免验证快速通行。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加白名单</h4>
                    <p>将特定车辆添加到白名单，设置通行权限和有效期。</p>
                  </div>
                  <div class="feature-item">
                    <h4>权限配置</h4>
                    <p>配置白名单车辆的通行范围和时间段限制。</p>
                  </div>
                  <div class="feature-item">
                    <h4>有效期管理</h4>
                    <p>设置和管理白名单车辆的有效期，到期自动失效。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 车辆入场记录 -->
            <div v-show="activeDoc === 'car-in-record'" class="doc-content">
              <h2>车辆入场记录</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>车辆入场记录模块用于查询和统计所有车辆的入场信息，包括入场时间、车牌号、车位分配等。</p>

                <h3>主要功能</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>入场记录查询</h4>
                    <p>支持按车牌号、入场时间、车场等多条件查询。</p>
                  </div>
                  <div class="feature-item">
                    <h4>入场统计</h4>
                    <p>统计指定时间段内的入场车辆数量和高峰时段。</p>
                  </div>
                  <div class="feature-item">
                    <h4>数据导出</h4>
                    <p>将入场记录导出为Excel表格，方便数据分析。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 车辆离场记录 -->
            <div v-show="activeDoc === 'car-out-record'" class="doc-content">
              <h2>车辆离场记录</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>车辆离场记录模块用于查询和统计所有车辆的离场信息，包括离场时间、停车时长、费用等。</p>

                <h3>主要功能</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>离场记录查询</h4>
                    <p>查询车辆的离场时间、停车时长、缴费金额等信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>费用统计</h4>
                    <p>统计指定时间段内的停车费用收入。</p>
                  </div>
                  <div class="feature-item">
                    <h4>停车时长分析</h4>
                    <p>分析车辆的平均停车时长，优化车位周转率。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 违规查询 -->
            <div v-show="activeDoc === 'violation-management'" class="doc-content">
              <h2>违规查询</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>违规查询模块用于处理车辆违规行为，包括违规记录查询、处理状态管理、黑名单管理等。</p>

                <h3>违规类型</h3>
                <div class="violation-types">
                  <el-tag type="warning">违规停车</el-tag>
                  <el-tag type="danger">未按位停车</el-tag>
                  <el-tag type="info">占用他人车位</el-tag>
                  <el-tag type="success">超时停车</el-tag>
                </div>

                <h3>处理流程</h3>
                <div class="process-flow">
                  <div class="flow-step">
                    <div class="flow-icon">1</div>
                    <div class="flow-content">
                      <h4>违规检测</h4>
                      <p>系统自动检测违规行为并生成违规记录</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">2</div>
                    <div class="flow-content">
                      <h4>记录查询</h4>
                      <p>管理员可以查看所有违规记录</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">3</div>
                    <div class="flow-content">
                      <h4>处理违规</h4>
                      <p>手动处理或自动处理违规记录</p>
                    </div>
                  </div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-step">
                    <div class="flow-icon">4</div>
                    <div class="flow-content">
                      <h4>黑名单管理</h4>
                      <p>达到阈值自动加入黑名单</p>
                    </div>
                  </div>
                </div>

                <h3>搜索功能</h3>
                <p>在顶部搜索框中输入车牌号或业主姓名，可以快速跳转到违规记录页面并自动填充搜索条件。</p>
              </div>
            </div>

            <!-- 违规位置配置 -->
            <div v-show="activeDoc === 'violation-location'" class="doc-content">
              <h2>违规位置配置</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>违规位置配置模块用于管理车场内可能发生违规行为的位置信息，方便快速定位和处理违规事件。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加违规位置</h4>
                    <p>新增违规高发位置，设置位置名称、编号和描述信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>编辑位置信息</h4>
                    <p>修改已有违规位置的详细信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>位置标记</h4>
                    <p>在车场平面图上标记违规高发区域，便于巡检人员识别。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 违规类型配置 -->
            <div v-show="activeDoc === 'violation-type'" class="doc-content">
              <h2>违规类型配置</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>违规类型配置模块用于定义和管理各种违规行为的类型，为违规记录提供标准化的分类依据。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>新增违规类型</h4>
                    <p>添加新的违规类型，设置类型名称、严重程度、扣分标准等。</p>
                  </div>
                  <div class="feature-item">
                    <h4>设置处罚规则</h4>
                    <p>为每种违规类型配置相应的处罚措施，如警告、罚款、扣分等。</p>
                  </div>
                  <div class="feature-item">
                    <h4>违规统计</h4>
                    <p>查看各类违规行为的发生频率和趋势分析。</p>
                  </div>
                </div>

                <h3>常见违规类型</h3>
                <ul>
                  <li><strong>违规停车</strong>：在非停车区域停放车辆</li>
                  <li><strong>占用消防通道</strong>：堵塞消防通道影响安全</li>
                  <li><strong>未按规定停放</strong>：车辆未停在指定车位内</li>
                  <li><strong>超时停车</strong>：超过规定时间未离场</li>
                  <li><strong>无证停车</strong>：未办理停车许可证擅自停车</li>
                </ul>
              </div>
            </div>

            <!-- 违规提醒管理 -->
            <div v-show="activeDoc === 'violation-reminder'" class="doc-content">
              <h2>违规提醒管理</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>违规提醒管理模块用于配置和管理违规提醒规则，当检测到违规行为时自动发送提醒通知。</p>

                <h3>提醒方式</h3>
                <div class="violation-types">
                  <el-tag type="primary">短信提醒</el-tag>
                  <el-tag type="success">微信通知</el-tag>
                  <el-tag type="warning">邮件提醒</el-tag>
                  <el-tag type="info">系统消息</el-tag>
                </div>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>配置提醒规则</h4>
                    <p>设置触发提醒的条件，如违规次数、时间间隔等。</p>
                  </div>
                  <div class="feature-item">
                    <h4>提醒模板</h4>
                    <p>编辑提醒消息的模板内容，支持动态变量替换。</p>
                  </div>
                  <div class="feature-item">
                    <h4>发送记录</h4>
                    <p>查看历史提醒发送记录和送达状态。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 拉黑原因配置 -->
            <div v-show="activeDoc === 'blacklist-reason'" class="doc-content">
              <h2>拉黑原因配置</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>拉黑原因配置模块用于定义和管理将车辆加入黑名单的标准原因，规范黑名单管理流程。</p>

                <h3>主要操作</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>添加拉黑原因</h4>
                    <p>新增拉黑原因类型，设置原因描述和对应的处理措施。</p>
                  </div>
                  <div class="feature-item">
                    <h4>设置严重等级</h4>
                    <p>为每种拉黑原因设置严重程度，便于分级管理。</p>
                  </div>
                  <div class="feature-item">
                    <h4>解禁条件</h4>
                    <p>配置每种拉黑原因对应的解禁条件和流程。</p>
                  </div>
                </div>

                <h3>常见拉黑原因</h3>
                <ul>
                  <li><strong>累计违规</strong>：违规次数达到设定阈值</li>
                  <li><strong>恶意欠费</strong>：长期拖欠停车费用不缴纳</li>
                  <li><strong>破坏设施</strong>：故意损坏车场设备或设施</li>
                  <li><strong>扰乱秩序</strong>：严重影响车场正常运营秩序</li>
                  <li><strong>安全隐患</strong>：存在重大安全隐患且拒不整改</li>
                </ul>
              </div>
            </div>

            <!-- 预约查询 -->
            <div v-show="activeDoc === 'appointment-query'" class="doc-content">
              <h2>预约查询</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>预约查询模块用于查询和统计所有车辆预约信息，包括预约状态、时间、车位等详细数据。</p>

                <h3>主要功能</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>预约记录查询</h4>
                    <p>支持按车牌号、预约时间、状态等多条件查询预约记录。</p>
                  </div>
                  <div class="feature-item">
                    <h4>预约统计</h4>
                    <p>统计预约成功率、热门时段等数据，优化车位分配。</p>
                  </div>
                  <div class="feature-item">
                    <h4>预约审核</h4>
                    <p>查看待审核的预约申请，进行审批操作。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 入场查询 -->
            <div v-show="activeDoc === 'venue-query'" class="doc-content">
              <h2>入场查询</h2>
              <div class="content-section">
                <h3>功能概述</h3>
                <p>入场查询模块用于查询当前在场车辆信息，包括入场时间、停车位置、预计费用等实时数据。</p>

                <h3>主要功能</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <h4>在场车辆查询</h4>
                    <p>快速查询当前在场的所有车辆信息。</p>
                  </div>
                  <div class="feature-item">
                    <h4>停车时长统计</h4>
                    <p>实时计算车辆停车时长和预计费用。</p>
                  </div>
                  <div class="feature-item">
                    <h4>车位占用情况</h4>
                    <p>查看车场车位的实时占用状态和空闲车位分布。</p>
                  </div>
                  <div class="feature-item">
                    <h4>超时预警</h4>
                    <p>对超时停车车辆进行预警提示。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 系统设置 -->
            <div v-show="activeDoc === 'system-settings'" class="doc-content">
              <h2>系统设置</h2>
              <div class="content-section">
                <h3>设置分类</h3>
                <div class="settings-categories">
                  <div class="category-item">
                    <h4>基础设置</h4>
                    <p>配置系统名称、版本、管理员信息等基本参数</p>
                  </div>
                  <div class="category-item">
                    <h4>安全设置</h4>
                    <p>配置密码策略、登录锁定、会话超时等安全参数</p>
                  </div>
                  <div class="category-item">
                    <h4>通知设置</h4>
                    <p>配置邮件通知、短信通知等通知方式</p>
                  </div>
                  <div class="category-item">
                    <h4>违规设置</h4>
                    <p>配置违规处理规则、黑名单策略等</p>
                  </div>
                </div>

                <h3>操作步骤</h3>
                <ol>
                  <li>点击左侧导航栏中的"系统设置"</li>
                  <li>选择要配置的设置分类</li>
                  <li>修改相应的参数值</li>
                  <li>点击"保存设置"按钮</li>
                </ol>
              </div>
            </div>

            <!-- 常见问题 -->
            <div v-show="activeDoc === 'faq-login'" class="doc-content">
              <h2>登录相关问题</h2>
              <div class="content-section">
                <div class="faq-list">
                  <div class="faq-item">
                    <h4>Q: 忘记密码怎么办？</h4>
                    <p>A: 请联系系统管理员重置密码，或使用"忘记密码"功能通过邮箱重置。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 登录时提示"账户被锁定"？</h4>
                    <p>A: 连续登录失败次数过多导致账户被锁定，请联系管理员解锁或等待锁定时间结束。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 无法访问系统页面？</h4>
                    <p>A: 请检查网络连接，确认系统地址是否正确，或联系技术支持。</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="activeDoc === 'faq-data'" class="doc-content">
              <h2>数据操作问题</h2>
              <div class="content-section">
                <div class="faq-list">
                  <div class="faq-item">
                    <h4>Q: 如何批量导入数据？</h4>
                    <p>A: 在相应的管理页面点击"批量导入"按钮，下载模板文件，填写数据后上传。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 数据导出功能如何使用？</h4>
                    <p>A: 在列表页面点击"导出"按钮，选择导出格式和字段，确认后即可下载。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 误删数据如何恢复？</h4>
                    <p>A: 请联系系统管理员，通过数据备份进行恢复操作。</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="activeDoc === 'faq-performance'" class="doc-content">
              <h2>性能优化问题</h2>
              <div class="content-section">
                <div class="faq-list">
                  <div class="faq-item">
                    <h4>Q: 页面加载速度慢怎么办？</h4>
                    <p>A: 可以尝试清理浏览器缓存，或联系管理员检查服务器性能。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 大量数据查询超时？</h4>
                    <p>A: 建议使用筛选条件缩小查询范围，或分批查询数据。</p>
                  </div>
                  <div class="faq-item">
                    <h4>Q: 系统响应慢？</h4>
                    <p>A: 可能是服务器负载过高，建议联系技术支持进行优化。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 联系支持 -->
            <div v-show="activeDoc === 'contact'" class="doc-content">
              <h2>联系支持</h2>
              <div class="content-section">
                <div class="contact-info">
                  <div class="contact-item">
                    <el-icon class="contact-icon"><Message /></el-icon>
                    <div class="contact-details">
                      <h4>技术支持</h4>
                      <p>邮箱：support@example.com</p>
                      <p>电话：400-123-4567</p>
                    </div>
                  </div>
                  <div class="contact-item">
                    <el-icon class="contact-icon"><User /></el-icon>
                    <div class="contact-details">
                      <h4>产品咨询</h4>
                      <p>邮箱：sales@example.com</p>
                      <p>电话：400-123-4568</p>
                    </div>
                  </div>
                  <div class="contact-item">
                    <el-icon class="contact-icon"><Clock /></el-icon>
                    <div class="contact-details">
                      <h4>服务时间</h4>
                      <p>工作日：9:00 - 18:00</p>
                      <p>紧急支持：7×24小时</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import { 
  QuestionFilled, Search, Document, User, WarningFilled, 
  Setting, Warning, Message, Clock, Avatar, Key, UserFilled,
  OfficeBuilding, Unlock, LocationInformation, Calendar, Tickets,
  CloseBold, CircleCheckFilled, TopRight, BottomLeft, Location, Bell, List
} from '@element-plus/icons-vue';

// 路由
const route = useRoute();

// 响应式数据
const activeDoc = ref('introduction');
const searchKeyword = ref('');

// 获取用户角色信息
const userRoleId = ref(route.query.roleId || localStorage.getItem('ms_role'));
const userRoleName = ref(route.query.roleName || localStorage.getItem('ms_role_name') || '');
const isAdmin = ref(route.query.isAdmin === 'true' || false);
const userMenus = ref([]);

// 🔐 判断是否是管理员（精确匹配角色名称，避免误判）
const checkIsAdmin = () => {
  const roleName = userRoleName.value;
  // 必须完全匹配以下角色名称之一，不能只是包含
  const adminRoles = ['管理员', '系统管理员', 'admin', 'administrator', 'Admin', 'Administrator', 'ADMIN', 'ADMINISTRATOR'];
  return adminRoles.includes(roleName);
};

// 🔑 从后端API获取用户的菜单权限
const loadUserMenus = async () => {
  try {
    const roleId = userRoleId.value;
    if (!roleId) {
      console.warn('HelpDocs: 角色ID为空，无法获取菜单权限');
      userMenus.value = [];
      return;
    }

    console.log('HelpDocs: 开始获取角色菜单，roleId:', roleId);
    
    const response = await request.get('/parking/role/sidebar/querySidebarById', {
      params: { id: roleId }
    });

    if (response && response.data) {
      userMenus.value = response.data;
      console.log('HelpDocs: ✅ 成功获取用户菜单权限:', userMenus.value);
    } else {
      console.warn('HelpDocs: ⚠️ 菜单数据为空');
      userMenus.value = [];
    }
  } catch (error) {
    console.error('HelpDocs: ❌ 获取菜单权限失败:', error);
    ElMessage.error('获取菜单权限失败');
    userMenus.value = [];
  }
};

// 🔍 检查用户是否有某个菜单的权限（根据菜单的 index 或 title 匹配）
const hasMenuPermission = (menuPath) => {
  if (isAdmin.value) {
    console.log(`HelpDocs: 管理员拥有所有权限，允许访问 "${menuPath}"`);
    return true;
  }
  
  // 从API获取的用户菜单权限
  const menus = userMenus.value;
  if (!menus || menus.length === 0) {
    console.warn('HelpDocs: 用户菜单权限为空，无法判断权限');
    return false;
  }
  
  // 递归检查菜单权限（菜单结构：{ index, title, icon, subs: [{ index, title }] }）
  const checkMenu = (menus, path) => {
    for (const menu of menus) {
      // 匹配父菜单的 index、title
      if (menu.index === path || 
          menu.title === path || 
          menu.index?.includes(path) || 
          menu.title?.includes(path)) {
        console.log('HelpDocs: 找到匹配的父菜单权限:', menu);
        return true;
      }
      
      // 检查子菜单 (subs)
      if (menu.subs && menu.subs.length > 0) {
        for (const sub of menu.subs) {
          if (sub.index === path || 
              sub.title === path || 
              sub.index?.includes(path) || 
              sub.title?.includes(path)) {
            console.log('HelpDocs: 找到匹配的子菜单权限:', sub);
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const hasPermission = checkMenu(menus, menuPath);
  console.log(`HelpDocs: 检查菜单权限 "${menuPath}":`, hasPermission, '可用菜单:', menus.map(m => ({ title: m.title, index: m.index, subs: m.subs?.map(s => ({ title: s.title, index: s.index })) })));
  return hasPermission;
};

// 基础导航项目（所有用户都能看到）
const quickStartItems = [
  { key: 'introduction', label: '系统介绍', icon: 'Document' },
  { key: 'quickstart', label: '快速入门', icon: 'User' }
];

// 功能导航项目（根据权限过滤）
const allFeatureItems = [
  // 用户权限管理
  { key: 'user-management', label: '用户管理', icon: 'User', menuPath: 'user' },
  { key: 'role-management', label: '角色管理', icon: 'Avatar', menuPath: 'RoleManagement' },
  { key: 'permission-management', label: '权限管理', icon: 'Key', menuPath: 'permission' },
  { key: 'staff-management', label: '巡检人员管理', icon: 'UserFilled', menuPath: 'StaffManagement' },
  
  // 小区业主管理
  { key: 'community-management', label: '小区管理', icon: 'OfficeBuilding', menuPath: 'CommunitySet' },
  { key: 'owner-management', label: '业主管理', icon: 'User', menuPath: 'OwnerInfo' },
  { key: 'gate-management', label: '出入口系统', icon: 'Unlock', menuPath: 'Gate' },
  
  // 停车管理
  { key: 'yard-management', label: '车场信息管理', icon: 'LocationInformation', menuPath: 'YardInfo' },
  { key: 'vehicle-reservation', label: '外来车辆预约', icon: 'Calendar', menuPath: 'VehicleReservation' },
  { key: 'month-ticket', label: '月票管理', icon: 'Tickets', menuPath: 'monthTicket' },
  { key: 'blacklist-management', label: '黑名单管理', icon: 'CloseBold', menuPath: 'blackList' },
  { key: 'whitelist-management', label: '白名单管理', icon: 'CircleCheckFilled', menuPath: 'WhitelistManagement' },
  { key: 'car-in-record', label: '车辆入场记录', icon: 'TopRight', menuPath: 'reportCarIn' },
  { key: 'car-out-record', label: '车辆离场记录', icon: 'BottomLeft', menuPath: 'reportCarOut' },
  
  // 违规管理
  { key: 'violation-management', label: '违规查询', icon: 'WarningFilled', menuPath: 'IllegalRegiste' },
  { key: 'violation-location', label: '违规位置配置', icon: 'Location', menuPath: 'ViolationLocationConfig' },
  { key: 'violation-type', label: '违规类型配置', icon: 'Document', menuPath: 'ViolationTypeConfig' },
  { key: 'violation-reminder', label: '违规提醒管理', icon: 'Bell', menuPath: 'ViolationReminder' },
  { key: 'blacklist-reason', label: '拉黑原因配置', icon: 'List', menuPath: 'BlacklistReasonConfig' },
  
  // 查询统计
  { key: 'appointment-query', label: '预约查询', icon: 'Search', menuPath: 'Appointment' },
  { key: 'venue-query', label: '入场查询', icon: 'Search', menuPath: 'Venue' },
  
  // 系统设置
  { key: 'system-settings', label: '系统设置', icon: 'Setting', adminOnly: true }
];

// 🔐 根据用户权限过滤功能项
const featureItems = computed(() => {
  console.log('HelpDocs: 开始过滤功能项，isAdmin:', isAdmin.value, 'userMenus:', userMenus.value.length);
  
  const filtered = allFeatureItems.filter(item => {
    // 如果是仅管理员项目，检查是否是管理员
    if (item.adminOnly) {
      const show = isAdmin.value;
      console.log(`HelpDocs: "${item.label}" 是管理员专属功能，显示: ${show}`);
      return show;
    }
    // 检查是否有对应菜单的权限
    if (item.menuPath) {
      const show = hasMenuPermission(item.menuPath);
      console.log(`HelpDocs: "${item.label}" 需要权限 "${item.menuPath}"，显示: ${show}`);
      return show;
    }
    return true;
  });
  
  console.log('HelpDocs: 过滤后的功能项数量:', filtered.length, filtered.map(i => i.label));
  return filtered;
});

const faqItems = [
  { key: 'faq-login', label: '登录问题', icon: 'User' },
  { key: 'faq-data', label: '数据操作', icon: 'Document' },
  { key: 'faq-performance', label: '性能优化', icon: 'Setting' },
  { key: 'contact', label: '联系支持', icon: 'Message' }
];

// 搜索处理
const handleSearch = (keyword) => {
  if (!keyword) return;
  
  // 简单的搜索逻辑，实际项目中可以实现更复杂的搜索
  const allItems = [...quickStartItems, ...featureItems.value, ...faqItems];
  const matchedItem = allItems.find(item => 
    item.label.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (matchedItem) {
    activeDoc.value = matchedItem.key;
  }
};

// 生命周期
onMounted(async () => {
  console.log('HelpDocs: 组件挂载，开始初始化...');
  
  // 检查是否是管理员
  isAdmin.value = checkIsAdmin();
  console.log('HelpDocs: 是否是管理员:', isAdmin.value);
  
  // 加载用户菜单权限
  await loadUserMenus();
  
  console.log('HelpDocs: ✅ 初始化完成，用户信息:', {
    roleId: userRoleId.value,
    roleName: userRoleName.value,
    isAdmin: isAdmin.value,
    menusCount: userMenus.value.length,
    menus: userMenus.value
  });
});
</script>

<style lang="scss" scoped>
.help-docs {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 24px;
  color: white;

  .page-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;

    .page-title {
      display: flex;
      align-items: center;
      gap: 16px;

      .title-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .header-icon {
          font-size: 24px;
          color: white;
        }
      }

      .title-text {
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .title-desc {
          margin: 4px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          
          .role-tag {
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: white;
            font-weight: 500;
          }
        }
      }
    }

    .header-actions {
      .search-input {
        width: 300px;

        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 20px;
        }
      }
    }
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.docs-nav-card {
  .docs-nav {
    .nav-section {
      margin-bottom: 24px;

      .section-title {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .nav-items {
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;

          &:hover {
            background: #f0f9ff;
            color: #1890ff;
          }

          &.active {
            background: #e6f7ff;
            color: #1890ff;
            border: 1px solid #91d5ff;
          }

          .nav-icon {
            font-size: 16px;
          }

          .nav-label {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.docs-content-card {
  .doc-content {
    h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #1890ff;
      padding-bottom: 8px;
    }

    .content-section {
      h3 {
        margin: 24px 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      h4 {
        margin: 16px 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0 0 16px 0;
        line-height: 1.6;
        color: #666;
      }

      ul, ol {
        margin: 0 0 16px 0;
        padding-left: 24px;

        li {
          margin-bottom: 8px;
          line-height: 1.6;
          color: #666;
        }
      }

      .operation-steps {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 20px 0;

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;

          .step-number {
            width: 32px;
            height: 32px;
            background: #1890ff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          .step-content {
            h4 {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }

            p {
              margin: 0;
              color: #666;
            }
          }
        }
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;

        .feature-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #1890ff;

          h4 {
            margin: 0 0 8px 0;
            color: #333;
          }

          p {
            margin: 0;
            color: #666;
          }
        }
      }

      .violation-types {
        display: flex;
        gap: 12px;
        margin: 16px 0;
        flex-wrap: wrap;
      }

      .process-flow {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 20px 0;
        flex-wrap: wrap;

        .flow-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          min-width: 200px;

          .flow-icon {
            width: 32px;
            height: 32px;
            background: #1890ff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          .flow-content {
            h4 {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #666;
            }
          }
        }

        .flow-arrow {
          font-size: 20px;
          color: #1890ff;
          font-weight: bold;
        }
      }

      .settings-categories {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;

        .category-item {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;

          h4 {
            margin: 0 0 8px 0;
            color: #333;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }
      }

      .warning-box {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #fff7e6;
        border: 1px solid #ffd591;
        border-radius: 8px;
        margin: 16px 0;

        .warning-icon {
          color: #fa8c16;
          font-size: 20px;
          margin-top: 2px;
        }

        .warning-content {
          p {
            margin: 0;
            color: #ad6800;
            font-size: 14px;
          }
        }
      }

      .faq-list {
        .faq-item {
          margin-bottom: 24px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #1890ff;

          h4 {
            margin: 0 0 12px 0;
            color: #333;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #666;
            line-height: 1.6;
          }
        }
      }

      .contact-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin: 20px 0;

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;

          .contact-icon {
            color: #1890ff;
            font-size: 24px;
            margin-top: 4px;
          }

          .contact-details {
            h4 {
              margin: 0 0 12px 0;
              color: #333;
              font-size: 16px;
            }

            p {
              margin: 0 0 8px 0;
              color: #666;
              font-size: 14px;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .page-header-content {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px !important;

    .header-actions .search-input {
      width: 100% !important;
    }
  }

  .el-col {
    margin-bottom: 16px;
  }

  .process-flow {
    flex-direction: column !important;

    .flow-arrow {
      transform: rotate(90deg);
    }
  }

  .operation-steps .step-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
