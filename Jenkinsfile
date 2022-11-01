//configure email subject & content
def subject = "${env.JOB_NAME} - Build #${env.BUILD_NUMBER}"
def content = '${JELLY_SCRIPT,template="html"}'

pipeline {
    agent any
    stages {
        stage('Configure') {
            steps {
                script {    
                    env.NAME = "mongo-crud-app/admin_module"
                    env.TAG = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
                    env.IMG = "${env.NAME}:${env.TAG}"
                    env.LATEST = "${env.NAME}:latest-${env.TAG}-${currentBuild.startTimeInMillis}"
                    env.cname = "admin_module"
                }
                echo "admin_module configure completed"
            }
        }
        stage('Build') {
            steps {
              echo "Building image.."
              echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
              sh '''
                echo "${IMG}"
                docker build -t ${IMG} .
                '''
              echo "Build completed"
            }
        }
        stage('Generate Test Report') {
            when {
                expression{
                    return false
                }
            }
            steps {
                script {
                    sh 'npm install'
                    sh 'npm run test'
                }
                echo "Test Reports Generation completed"
            }
            post {
                always {
                step([$class: 'CoberturaPublisher', coberturaReportFile: 'coverage/cobertura-coverage.xml'])
                }
            }
        }

        stage('Upload Image') {
            steps {
              echo "Uploading image to nexus repository.."
              echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
              sh '''
              #docker logout
              docker tag ${IMG} YOUR_NEXUS_IP:8082/${LATEST}
              #docker login
              docker push YOUR_NEXUS_IP:8082/${LATEST}
              '''
              echo "Upload Image completed"
            }
        }

        stage('Deploy to Dev') {
            steps {
                echo "Deploying to Dev.."
                sh '''
                    #cname=nodejsdev
                    echo "name= ${cname}"
                    if [ "$(docker ps -qa -f name=$cname)" ]; then
                        echo ":: Found container - $cname"
                        if [ "$(docker ps -q -f name=$cname)" ]; then
                            echo ":: Stopping running container - $cname"
                            docker stop $cname;
                        fi
                        echo ":: Removing stopped container - $cname"
                        docker rm $cname;
                    fi                    
                    # run your container
                    docker run -d --name ${cname} -p ${ADMIN_NODE_SERVER_PORT_DEV}:${ADMIN_NODE_SERVER_PORT_DEV} -e MONGODB_URL=${MONGODB_URL_DEV} -e KONG_KEY=${KONG_KEY_DEV} -e KONG_SECRET=${KONG_SECRET_DEV} -e JWT_TOKEN_KEY=${JWT_TOKEN_KEY} -e SWAGGER_URL=${SWAGGER_URL_DEV} -e PORT=${ADMIN_NODE_SERVER_PORT_DEV} YOUR_NEXUS_IP:8082/${LATEST}
                    docker image prune -a -f
                '''
                echo "Deploy to Dev completed"
            }
        }

        stage('Decide QA Deployment') {
            options {
                timeout(time: 24, unit: 'HOURS')
            }
            steps {
                script {
                        try {
                            env.QA_Deployment = input message: 'User input required',
                            parameters: [choice(name: 'Deploy to QA?', choices: 'no\nyes', description: 'Choose "yes" if you want to deploy this build to QA')]
                        } catch (Throwable e) {
                            echo "Caught ${e.toString()}"
                            currentBuild.result = "SUCCESS"
                            env.QA_Deployment = 'no'
                        }
                    }
                }
        }

        stage('Deploy to QA') {
            when {
                environment name: 'QA_Deployment', value: 'yes'
            }
            steps {
                echo "Deploying to QA.."
                echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
                sshagent(credentials: ['deploy-nodejs-app-qa']) {
                    sh '''
                        ssh YOUR_USER_ID@YOUR_QA_IP -o StrictHostKeyChecking=no "
                        #docker login
                        docker pull YOUR_NEXUS_IP:8082/${LATEST}
                        #assign a cname to the container so that it can be accessed later
                        #cname=nodejsqa
                        echo "cname=${cname}"
                        if [ "$(docker ps -qa -f name=$cname)" ]; then
                            echo ":: Found container - $cname"
                            if [ "$(docker ps -q -f name=$cname)" ]; then
                                echo ":: Stopping running container - $cname"
                                docker stop $cname;
                            fi
                            echo ":: Removing stopped container - $cname"
                            docker rm $cname;
                        fi                    
                        docker run -d --name ${cname} -p ${ADMIN_NODE_SERVER_PORT_QA}:${ADMIN_NODE_SERVER_PORT_QA} -e PORT=${ADMIN_NODE_SERVER_PORT_QA} -e MONGODB_URL=${MONGODB_URL_QA} -e KONG_KEY=${KONG_KEY_QA} -e KONG_SECRET=${KONG_SECRET_QA} -e JWT_TOKEN_KEY=${JWT_TOKEN_KEY} -e SWAGGER_URL=${SWAGGER_URL_QA}  YOUR_NEXUS_IP:8082/${LATEST}
                        docker image prune -a -f
                        "
                    '''
                }
                echo "Deploy to QA completed"
            }
        }

        stage('Decide UAT Deployment') {
            options {
                timeout(time: 24, unit: 'HOURS')
            }
            steps {
                script {
                        try {
                            env.UAT_Deployment = input message: 'User input required',
                            parameters: [choice(name: 'Deploy to UAT?', choices: 'no\nyes', description: 'Choose "yes" if you want to deploy this build to UAT')]
                        } catch (Throwable e) {
                            echo "Caught ${e.toString()}"
                            currentBuild.result = "SUCCESS"
                            env.UAT_Deployment = 'no'
                        }
                    }
                }
        }

        stage('Deploy to UAT') {
            when {
                environment name: 'UAT_Deployment', value: 'yes'
            }
            steps {
                echo "Deploying to UAT.."
                echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
                sshagent(credentials: ['deploy-nodejs-app-uat']) {
                    sh '''
                        ssh YOUR_USER_ID@YOUR_UAT_IP -o StrictHostKeyChecking=no "
                        #docker login
                        docker pull YOUR_NEXUS_IP:8082/${LATEST}
                        #assign a cname to the container so that it can be accessed later
                        #cname=nodeapp
                        echo "cname=${cname}"
                        if [ "$(docker ps -qa -f name=$cname)" ]; then
                            echo ":: Found container - $cname"
                            if [ "$(docker ps -q -f name=$cname)" ]; then
                                echo ":: Stopping running container - $cname"
                                docker stop $cname;
                            fi
                            echo ":: Removing stopped container - $cname"
                            docker rm $cname;
                        fi                    
                        docker run -d --name ${cname}  --restart=on-failure:3  -p ${ADMIN_NODE_SERVER_PORT_UAT}:${ADMIN_NODE_SERVER_PORT_UAT} -e PORT=${ADMIN_NODE_SERVER_PORT_UAT} -e MONGODB_URL=${MONGODB_URL_UAT} -e KONG_KEY=${KONG_KEY_UAT} -e KONG_SECRET=${KONG_SECRET_UAT} -e JWT_TOKEN_KEY=${JWT_TOKEN_KEY} -e SWAGGER_URL=${SWAGGER_URL_UAT} YOUR_NEXUS_IP:8082/${LATEST}
                        docker image prune -a -f
                        "
                    '''
                }
                echo "Deploy to UAT completed"
            }
        }
        stage('Decide Prod Deployment') {
            options {
                timeout(time: 24, unit: 'HOURS')
            }
            steps {
                script {
                        try {
                            env.Prod_Deployment = input message: 'User input required',
                            parameters: [choice(name: 'Deploy to Prod?', choices: 'no\nyes', description: 'Choose "yes" if you want to deploy this build to Prod')]
                        } catch (Throwable e) {
                            echo "Caught ${e.toString()}"
                            currentBuild.result = "SUCCESS"
                            env.Prod_Deployment = 'no'
                        }
                    }
                }
        }

        stage('Deploy to Prod Node1') {
            when {
                environment name: 'Prod_Deployment', value: 'yes'
            }
            steps {
                echo "Deploying to Prod Node1.."
                echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
                // sshagent(credentials: ['deploy-nodejs-app-qa']) {
                    sh '''
                        ssh YOUR_USER_ID@YOUR_PROD_IP -o StrictHostKeyChecking=no "
                        #docker login
                        docker pull YOUR_NEXUS_IP:8082/${LATEST}
                        #assign a cname to the container so that it can be accessed later
                        #cname=nodejsqa
                        echo "cname=${cname}"
                        if [ "$(docker ps -qa -f name=$cname)" ]; then
                            echo ":: Found container - $cname"
                            if [ "$(docker ps -q -f name=$cname)" ]; then
                                echo ":: Stopping running container - $cname"
                                docker stop $cname;
                            fi
                            echo ":: Removing stopped container - $cname"
                            docker rm $cname;
                        fi                    
                        docker run -d --name ${cname} -p ${ADMIN_NODE_SERVER_PORT_PROD}:${ADMIN_NODE_SERVER_PORT_PROD} -e PORT=${ADMIN_NODE_SERVER_PORT_PROD} -e MONGODB_URL=${MONGODB_URL_PROD_SECONDARY} -e KONG_KEY=${KONG_KEY_PROD} -e KONG_SECRET=${KONG_SECRET_PROD} -e JWT_TOKEN_KEY=${JWT_TOKEN_KEY} -e SWAGGER_URL=${SWAGGER_URL_PROD} YOUR_NEXUS_IP:8082/${LATEST}
                        docker image prune -a -f
                        "
                    '''
                // }
                echo "Deploy to Prod Node1 completed"
            }
        }

        stage('Decide Prod Node2 Deployment') {
            options {
                timeout(time: 24, unit: 'HOURS')
            }
            steps {
                script {
                        try {
                            env.Prod_Node2_Deployment = input message: 'User input required',
                            parameters: [choice(name: 'Deploy to Prod Node2?', choices: 'no\nyes', description: 'Choose "yes" if you want to deploy this build to Prod Node2')]
                        } catch (Throwable e) {
                            echo "Caught ${e.toString()}"
                            currentBuild.result = "SUCCESS"
                            env.Prod_Node2_Deployment = 'no'
                        }
                    }
                }
        }

        stage('Deploy to Prod Node2') {
            when {
                environment name: 'Prod_Node2_Deployment', value: 'yes'
            }
            steps {
                echo "Deploying to Prod Node2.."
                echo "NAME: ${NAME}, TAG: ${TAG}, IMG: ${IMG}, LATEST: ${LATEST}"
                // sshagent(credentials: ['deploy-nodejs-app-uat']) {
                    sh '''
                        ssh YOUR_USER_ID@YOUR_PROD_IP_2 -o StrictHostKeyChecking=no "
                        #docker login
                        docker pull YOUR_NEXUS_IP:8082/${LATEST}
                        #assign a cname to the container so that it can be accessed later
                        #cname=nodeapp
                        echo "cname=${cname}"
                        if [ "$(docker ps -qa -f name=$cname)" ]; then
                            echo ":: Found container - $cname"
                            if [ "$(docker ps -q -f name=$cname)" ]; then
                                echo ":: Stopping running container - $cname"
                                docker stop $cname;
                            fi
                            echo ":: Removing stopped container - $cname"
                            docker rm $cname;
                        fi                    
                        docker run -d --name ${cname} -p ${ADMIN_NODE_SERVER_PORT_PROD}:${ADMIN_NODE_SERVER_PORT_PROD} -e PORT=${ADMIN_NODE_SERVER_PORT_PROD} -e MONGODB_URL=${MONGODB_URL_PROD_SECONDARY} -e KONG_KEY=${KONG_KEY_PROD} -e KONG_SECRET=${KONG_SECRET_PROD} -e JWT_TOKEN_KEY=${JWT_TOKEN_KEY} -e SWAGGER_URL=${SWAGGER_URL_PROD} YOUR_NEXUS_IP:8082/${LATEST}
                        docker image prune -a -f
                        "
                    '''
                // }
                echo "Deploy to Prod Node2 completed"
            }
        }
    }
    post {
        always {
            emailext body: content, mimeType: 'text/html', recipientProviders: [developers(), requestor(), culprits()], subject: subject, to: '$DEFAULT_RECIPIENTS', attachLog: true, replyTo: '$DEFAULT_REPLYTO'
        }
    }
}


