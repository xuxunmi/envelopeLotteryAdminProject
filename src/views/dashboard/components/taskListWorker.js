// chrome://inspect/#workers
// 连接数组
const ports = [];

onconnect = (e) => {
  console.log("连接成功！", e, ports);
  const port = e.ports[0];
  ports.push(port);
  port.onmessage = (msg) => {
    console.log("收到信息：", msg);
    const data = msg.data
    // 循环向所有端口广播
    ports.forEach((p) => {
      p.postMessage(data);
    });
  };
};
