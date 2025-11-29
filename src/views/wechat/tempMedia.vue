<template>
  <div class="temp-media-container">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>微信临时素材管理</span>
          <el-button style="float: right;" type="primary" size="small" @click="handleRefreshAll">批量刷新素材</el-button>
        </div>
      </template>

      <!-- 上传区域 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-alert
            title="提示：临时素材在微信后台保存3天，系统会自动定时刷新（每2天凌晨3点），也可手动刷新"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <i class="el-icon-upload"></i>
              <span> 上传新素材</span>
            </template>
            
            <el-form :model="uploadForm" label-width="100px">
              <el-form-item label="素材类型">
                <el-select v-model="uploadForm.mediaType" placeholder="请选择素材类型">
                  <el-option label="图片" value="image"></el-option>
                  <el-option label="语音" value="voice"></el-option>
                  <el-option label="视频" value="video"></el-option>
                  <el-option label="缩略图" value="thumb"></el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="素材用途">
                <el-input v-model="uploadForm.description" placeholder="如：小程序二维码"></el-input>
              </el-form-item>
              
              <el-form-item label="选择文件">
                <el-upload
                  class="upload-demo"
                  :action="uploadUrl"
                  :data="uploadData"
                  :before-upload="beforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :show-file-list="true"
                  :limit="1"
                  :file-list="fileList"
                  accept="image/*">
                  <el-button size="small" type="primary">点击上传</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      图片大小不超过2MB，支持jpg/png/gif格式
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <i class="el-icon-info"></i>
              <span> 使用说明</span>
            </template>
            <div class="info-content">
              <h4>功能说明：</h4>
              <ol>
                <li>上传小程序二维码等图片素材到微信服务器</li>
                <li>用于在用户关注公众号时发送欢迎消息</li>
                <li>临时素材有效期为3天，系统会自动刷新</li>
                <li>可以手动刷新单个素材或批量刷新所有素材</li>
              </ol>
              
              <h4>注意事项：</h4>
              <ul>
                <li>建议先上传"小程序二维码"用途的素材</li>
                <li>图片大小不超过2MB</li>
                <li>素材上传后会保存到本地，供自动刷新使用</li>
                <li>定时任务：每2天凌晨3点自动刷新</li>
              </ul>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 素材列表 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <i class="el-icon-picture"></i>
              <span> 已上传的素材列表</span>
              <el-button style="float: right;" type="text" size="small" @click="loadMediaList">
                <i class="el-icon-refresh"></i> 刷新列表
              </el-button>
            </template>
            
            <el-table :data="mediaList" style="width: 100%" v-loading="loading">
              <el-table-column prop="description" label="用途" width="150"></el-table-column>
              <el-table-column prop="mediaType" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="getMediaTypeTag(scope.row.mediaType)">
                    {{ scope.row.mediaType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" width="200" show-overflow-tooltip></el-table-column>
              <el-table-column prop="fileSize" label="大小" width="100">
                <template #default="scope">
                  {{ formatFileSize(scope.row.fileSize) }}
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="expiredAt" label="过期时间" width="180">
                <template #default="scope">
                  <span :class="getExpireClass(scope.row.expiredAt)">
                    {{ formatDate(scope.row.expiredAt) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                    {{ scope.row.status === 1 ? '有效' : '已过期' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                  <el-button type="text" size="small" @click="handleRefresh(scope.row)">
                    <i class="el-icon-refresh"></i> 刷新
                  </el-button>
                  <el-button type="text" size="small" @click="handleViewMediaId(scope.row)">
                    <i class="el-icon-view"></i> 查看ID
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'TempMedia',
  data() {
    return {
      uploadForm: {
        mediaType: 'image',
        description: '小程序二维码'
      },
      fileList: [],
      // uploadUrl: 'http://www.xuerparking.cn:8543/parking/wechat/media/upload',
      uploadUrl: 'https://www.xuerparking.cn/parking/wechat/media/upload',
      mediaList: [],
      loading: false
    }
  },
  computed: {
    uploadData() {
      return {
        mediaType: this.uploadForm.mediaType,
        description: this.uploadForm.description
      }
    }
  },
  mounted() {
    this.loadMediaList()
  },
  methods: {
    beforeUpload(file) {
      // 验证文件
      if (this.uploadForm.mediaType === 'image') {
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isImage) {
          this.$message.error('只能上传图片文件!')
          return false
        }
        if (!isLt2M) {
          this.$message.error('图片大小不能超过 2MB!')
          return false
        }
      }

      if (!this.uploadForm.description) {
        this.$message.error('请填写素材用途!')
        return false
      }

      return true
    },
    
    handleUploadSuccess(response, file, fileList) {
      if (response.code === '0') {
        this.$message.success('上传成功!')
        this.fileList = []
        this.loadMediaList()
      } else {
        this.$message.error('上传失败: ' + response.msg)
      }
    },
    
    handleUploadError(err, file, fileList) {
      this.$message.error('上传失败: ' + err.message)
    },
    
    async loadMediaList() {
      this.loading = true
      try {
        // 这里需要实现一个查询所有素材的接口
        // 暂时使用常见的用途查询
        const descriptions = ['小程序二维码', '欢迎图片', '活动海报']
        const promises = descriptions.map(desc => 
          request.get('/parking/wechat/media/getInfo', { params: { description: desc } })
        )
        
        const results = await Promise.all(promises)
        this.mediaList = results
          .filter(res => res.code === '0' && res.data)
          .map(res => res.data)
        
      } catch (error) {
        console.error('加载素材列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async handleRefresh(row) {
      this.$confirm('确认要刷新该素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const loading = this.$loading({
          lock: true,
          text: '刷新中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        try {
          const response = await request.post('/parking/wechat/media/refresh', null, {
            params: { description: row.description }
          })
          
          if (response.code === '0') {
            this.$message.success('刷新成功!')
            this.loadMediaList()
          } else {
            this.$message.error('刷新失败: ' + response.msg)
          }
        } catch (error) {
          this.$message.error('刷新失败: ' + error.message)
        } finally {
          loading.close()
        }
      }).catch(() => {})
    },
    
    async handleRefreshAll() {
      this.$confirm('确认要批量刷新所有素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const loading = this.$loading({
          lock: true,
          text: '批量刷新中，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        try {
          const response = await request.post('/parking/wechat/media/refreshAll')
          
          if (response.code === '0') {
            this.$message.success(`批量刷新完成，成功刷新 ${response.data} 个素材!`)
            this.loadMediaList()
          } else {
            this.$message.error('批量刷新失败: ' + response.msg)
          }
        } catch (error) {
          this.$message.error('批量刷新失败: ' + error.message)
        } finally {
          loading.close()
        }
      }).catch(() => {})
    },
    
    handleViewMediaId(row) {
      this.$alert(`Media ID: ${row.mediaId}`, '素材ID', {
        confirmButtonText: '复制',
        callback: () => {
          // 复制到剪贴板
          const input = document.createElement('input')
          input.value = row.mediaId
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
          this.$message.success('已复制到剪贴板')
        }
      })
    },
    
    getMediaTypeTag(type) {
      const typeMap = {
        'image': 'success',
        'voice': 'warning',
        'video': 'danger',
        'thumb': 'info'
      }
      return typeMap[type] || 'info'
    },
    
    formatFileSize(size) {
      if (!size) return '-'
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
      return (size / 1024 / 1024).toFixed(2) + ' MB'
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    },
    
    getExpireClass(expiredAt) {
      if (!expiredAt) return ''
      const now = new Date()
      const expire = new Date(expiredAt)
      const diff = expire - now
      
      if (diff < 0) return 'text-danger'
      if (diff < 24 * 60 * 60 * 1000) return 'text-warning' // 小于1天
      return 'text-success'
    }
  }
}
</script>

<style scoped>
.temp-media-container {
  padding: 20px;
}

.info-content {
  line-height: 1.8;
}

.info-content h4 {
  color: #409EFF;
  margin-top: 15px;
  margin-bottom: 10px;
}

.info-content ol, .info-content ul {
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 8px;
}

.text-danger {
  color: #F56C6C;
  font-weight: bold;
}

.text-warning {
  color: #E6A23C;
  font-weight: bold;
}

.text-success {
  color: #67C23A;
}
</style>
