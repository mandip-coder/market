export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  if (Notification.permission === "default") {
     await Notification.requestPermission();
  } 
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  link?: string;
}

export function showNotification(options: NotificationOptions) {
  if (Notification.permission === "granted") {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      if (options.link) {
        window.open(options.link, "_blank");
      }
    };
  }
}
